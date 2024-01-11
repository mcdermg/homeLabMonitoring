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
