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
default-endpoint:
    group: Websites
    interval: 15m
    alerts:
        - type: slack
    conditions:
        - '[STATUS] == 200'
        - '[RESPONSE_TIME] < 1000'
        # 5 min minimum
        - '[DOMAIN_EXPIRATION] > 720h'
        - '[CERTIFICATE_EXPIRATION] > 240h'
internal-endpoint:
    group: Cluster
    interval: 5m
    alerts:
        - type: slack
    conditions:
        - '[CONNECTED] == true'
        - '[RESPONSE_TIME] < 200'
endpoints:
    - name: garymcdermott
      !!merge <<:
        group: Websites
        interval: 15m
        alerts:
            - type: slack
        conditions:
            - '[STATUS] == 200'
            - '[RESPONSE_TIME] < 1000'
            - '[DOMAIN_EXPIRATION] > 720h' # 5 min minimum
            - '[CERTIFICATE_EXPIRATION] > 240h'
      url: https://www.garymcdermott.net
    - name: Telecentro
      !!merge <<:
        group: Cluster
        interval: 5m
        alerts:
            - type: slack
        conditions:
            - '[CONNECTED] == true'
            - '[RESPONSE_TIME] < 200'
      group: Network
      url: icmp://192.168.0.1
    - name: control
      !!merge <<:
        group: Cluster
        interval: 5m
        alerts:
            - type: slack
        conditions:
            - '[CONNECTED] == true'
            - '[RESPONSE_TIME] < 200'
      url: icmp://192.168.0.66
    - name: node-1
      !!merge <<:
        group: Cluster
        interval: 5m
        alerts:
            - type: slack
        conditions:
            - '[CONNECTED] == true'
            - '[RESPONSE_TIME] < 200'
      url: icmp://192.168.0.65
    - name: node-2
      !!merge <<:
        group: Cluster
        interval: 5m
        alerts:
            - type: slack
        conditions:
            - '[CONNECTED] == true'
            - '[RESPONSE_TIME] < 200'
      url: icmp://192.168.0.64
    - name: node-3
      !!merge <<:
        group: Cluster
        interval: 5m
        alerts:
            - type: slack
        conditions:
            - '[CONNECTED] == true'
            - '[RESPONSE_TIME] < 200'
      url: icmp://192.168.0.63
