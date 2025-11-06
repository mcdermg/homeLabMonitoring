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

    - name: "Mikrotick WAN"
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.0.98

    - name: "Mikrotick LAN"
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.1.1

    - name: "TL-SG105PE Switch"
      <<: *internal
      group: "1. Network"
      url: icmp://192.168.1.253

    - name: Proxmox Server
      <<: *internal
      group: "2. Proxmox"
      url: icmp://192.168.1.250

    - name: "Pi4 Control 01"
      <<: *internal
      group: "3. Cluster"
      url: icmp://192.168.1.252

    - name: k3s-control-tf-01
      <<: *internal
      group: "3. Cluster"
      url: icmp://192.168.1.210 

    - name: k3s-control-tf-02
      <<: *internal
      group: "3. Cluster"
      url: icmp://192.168.1.211    

    - name: "P3 Node-1"
      <<: *internal
      group: "3. Cluster"
      url: icmp://192.168.1.251

    - name: k3s-node-tf-01
      <<: *internal
      group: "3. Cluster"
      url: icmp://192.168.1.215

    - name: k3s-node-tf-02
      <<: *internal
      group: "3. Cluster"
      url: icmp://192.168.1.216

    - name: k8status
      <<: *internal
      group: "4. Services"
      url: "http://192.168.1.11/"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"      

    - name: Nginx
      <<: *internal
      group: "4. Services"
      url: "http://192.168.1.12/"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"      

    - name: garymcdermott
      <<: *defaults
      group: "5. External"
      conditions:
        - '[RESPONSE_TIME] < 4000' # Some issue on the zero with the inital connections being very latent
      url: https://www.garymcdermott.net

#    - name: Grafana-service
#      <<: *internal
#      group: Services
#      url: "http://192.168.0.242/api/health"
#      conditions:
#        - "[STATUS] == 200"
#        - "[RESPONSE_TIME] < 1000"
#        - "[BODY].database == ok"
#
#    - name: Prometheus-service
#      <<: *internal
#      group: Services
#      url: "http://192.168.0.243/-/healthy"
#      conditions:
#        - "[STATUS] == 200"
#        - "[RESPONSE_TIME] < 1000"
#        - "[BODY] == Prometheus is Healthy."

