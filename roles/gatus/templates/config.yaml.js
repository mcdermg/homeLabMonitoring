# Gatus Config
storage:
  type: sqlite
  path: ./data/data.db

web:
    port: 80
ui:
    title: Health Dashboard
    description: Gatus monitoring dashboard
    header: Health Status
    buttons:
        - name: Blog
          link: https://garymcdermott.net/
        - name: GitHub
          link: https://github.com/mcdermg
        - name: LinkedIn
          link: https://www.linkedin.com/in/garymcdermott
alerting:
    slack:
        webhook-url:  {{ GATUS_SLACK_HOOK }}
        default-alert:
            description: Healthcheck failed 3 times in a row
            send-on-resolved: true
            failure-threshold: 3
            success-threshold: 3

default-endpoint: &defaults
    group: Websites
    interval: 15m
    alerts:
        - type: slack
    conditions:
        - '[STATUS] == 200'
        - '[RESPONSE_TIME] < 1000'
        - '[DOMAIN_EXPIRATION] > 720h' # 5 min minimum
        - '[CERTIFICATE_EXPIRATION] > 240h'

internal-endpoint: &internal
    group: Cluster
    interval: 5m
    alerts:
        - type: slack
    conditions:
        - '[CONNECTED] == true'
        - '[RESPONSE_TIME] < 200'

endpoints:
    - name: Telecentro
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.0.1

    - name: "MikroTik WAN"
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.0.98

    - name: "MikroTik LAN"
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.1.1

    - name: "TL-SG105PE Switch"
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.1.254

    - name: PVE01
      <<: *internal
      group: "3. Proxmox"
      url: icmp://192.168.1.250

    - name: PVE02
      <<: *internal
      group: "3. Proxmox"
      url: icmp://192.168.1.251

    - name: Control - Pi4
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.241

    - name: Control - k3s 01
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.210

    - name: Control - k3s 02
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.211

    - name: Worker - Pi3
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.242

    - name: Worker - k3s 01
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.215

    - name: Worker - k3s 02
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.216

    - name: Worker - k3s 03
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.217

    - name: Worker - k3s 04
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.218

    - name: Worker - k3s 05
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.219

    - name: Worker - k3s 06
      <<: *internal
      group: "4. Cluster"
      url: icmp://192.168.1.220

    - name: k8status
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.11/"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"

    - name: Nginx Web Server
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.12/"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"

    - name: LibreSpeed
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.111:8080/"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"

    - name: Pulse
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.112:7655/api/health"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"
        - "[BODY].status == healthy"

    # Each tunnel replica's /ready, not a ping: it fails when the tunnel has no live connections to Cloudflare
    - name: Cloudflared-01
      <<: *internal
      group: "2. Network services"
      url: "http://192.168.1.113:20241/ready"
      conditions:
        - "[STATUS] == 200"
        - "[BODY].readyConnections > 0"

    - name: Cloudflared-02
      <<: *internal
      group: "2. Network services"
      url: "http://192.168.1.118:20241/ready"
      conditions:
        - "[STATUS] == 200"
        - "[BODY].readyConnections > 0"

    # A real query, not a ping: a frozen container still answers pings (LAB-110)
    - name: Bind9-01
      <<: *internal
      group: "2. Network services"
      url: "192.168.1.115"
      dns:
        query-name: pve01.homelab.local
        query-type: A
      conditions:
        - "[DNS_RCODE] == NOERROR"
        - "[BODY] == 192.168.1.250"

    - name: Bind9-02
      <<: *internal
      group: "2. Network services"
      url: "192.168.1.119"
      dns:
        query-name: pve01.homelab.local
        query-type: A
      conditions:
        - "[DNS_RCODE] == NOERROR"
        - "[BODY] == 192.168.1.250"

    # The floating IP keepalived keeps on whichever bind9 is up (LAB-117), so this only fails with both down.
    # Checked every minute: with both down the lab has no internal DNS
    - name: DNS
      <<: *internal
      group: "2. Network services"
      interval: 1m
      url: "192.168.1.153"
      dns:
        query-name: pve01.homelab.local
        query-type: A
      conditions:
        - "[DNS_RCODE] == NOERROR"
        - "[BODY] == 192.168.1.250"

    - name: PostgreSQL
      <<: *internal
      group: "5. Services"
      url: icmp://192.168.1.116

    - name: Gitea
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.117/"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"

    - name: garymcdermott
      <<: *defaults
      group: "6. External"
      conditions:
        - '[RESPONSE_TIME] < 4000' # Some issue on the monitoring Pi with the inital connections being very latent
      url: https://www.garymcdermott.net

    - name: Grafana-service
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.14/api/health"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"
        - "[BODY].database == ok"

    - name: Prometheus-service
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.15/-/healthy"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"
        - "[BODY] == Prometheus Server is Healthy."

    # Catches a k3s Alertmanager that's up but can't alert, from outside the cluster (LAB-124)
    - name: Alertmanager-service
      <<: *internal
      group: "5. Services"
      url: "http://192.168.1.16/-/healthy"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"
