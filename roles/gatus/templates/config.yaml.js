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
        webhook-url: {{ GATUS_SLACK_HOOK }}
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
    - name: garymcdermott
      <<: *defaults
      conditions:
        - '[RESPONSE_TIME] < 4000' # Some issue on the zero with the inital connections being very latent
      url: https://www.garymcdermott.net

    - name: Telecentro
      <<: *internal
      group: Network
      url: icmp://192.168.0.1

    - name: control
      <<: *internal
      url: icmp://192.168.0.66
    - name: node-1
      <<: *internal
      url: icmp://192.168.0.65    
    - name: node-2
      <<: *internal
      url: icmp://192.168.0.64    
    - name: node-3
      <<: *internal
      url: icmp://192.168.0.63

    - name: Deployment-test-service
      <<: *internal
      group: Services
      url: "http://192.168.0.241"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"      

    - name: Grafana-service
      <<: *internal
      group: Services
      url: "http://192.168.0.242/api/health"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"
        - "[BODY].database == ok"

    - name: Prometheus-service
      <<: *internal
      group: Services
      url: "http://192.168.0.243/-/healthy"
      conditions:
        - "[STATUS] == 200"
        - "[RESPONSE_TIME] < 1000"
        - "[BODY] == Prometheus is Healthy."
  
    - name: Telegraf
      <<: *internal
      group: Services
      url: "http://192.168.0.66:9283/metrics"

    - name: Heimdall
      <<: *internal
      group: Services
      url: "http://192.168.0.66:8080"
      conditions:
        - "[RESPONSE_TIME] < 1000" # More time needed as not responsive for some reason

#    - name: mosquitto
#      url: "tcp://192.168.0.35:1883"
#      interval: 30s
#      conditions: 
#        - "[CONNECTED] == true"

#    - name: sensor-01
#      <<: *internal
#      group: Sensors
#      url: icmp://192.168.0.81
#      interval: 60s
