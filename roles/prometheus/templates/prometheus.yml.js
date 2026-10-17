global:
  scrape_interval:     {{ GLOBAL_SCRAPE_INTERVAL }}
  evaluation_interval: {{ GLOBAL_EVALUATION_INTERVAL }}
  # scrape_timeout is set to the global default (10s).

  # Attach these labels to any time series or alerts when communicating with
  # external systems (federation, remote storage, Alertmanager).
  external_labels:
      monitor: 'cluster'

# Alertmanager configuration
alerting:
  alertmanagers:
  - static_configs:
    - targets: ['localhost:9093']

rule_files:
   - {{ RULE_FILES }}

scrape_configs:
  - job_name: 'prometheus'
    scrape_interval: 60s
    scrape_timeout: 60s
    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.
    static_configs:
      - targets: ['localhost:9090']
  - job_name: node
    static_configs:
      - targets: ['localhost:9100']
  - job_name: pi-nodes
    static_configs:
      - targets: [{{ HOSTS }}]
  - job_name: "ispmonitor"
    scrape_interval: 120s
    static_configs:
      - targets: [{{ TELEGRAF_HOST }}] # RPi Telegraf agent
  - job_name: "isp-download"
    scrape_interval: 3h
    scrape_timeout: 60s
    metrics_path: /probe
    params:
      module: [http_download]
    static_configs:
      - targets:
          - http://cachefly.cachefly.net/100mb.test
          - https://proof.ovh.net/files/100Mb.dat
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: 192.168.1.249:9115 # monitor_isp Blackbox container
