{% set blackbox_exporter = "192.168.1.249:9115" %}{# monitor_isp Blackbox container on the MikroTik #}
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
      # Pi 3; the Pi 4 (192.168.1.241) has no node_exporter yet and would trip the Node down alert
      - targets: ['192.168.1.242:9100']
  # job names match blackbox-dashboard.json in the monitor_isp repo
  - job_name: "blackbox-icmp-poc"
    metrics_path: /probe
    params:
      module: [icmp_ipv4]
    static_configs:
      - targets:
          - 1.1.1.1
          - bbc.com
          - garymcdermott.net
          - google.com
          - mercadolibre.com.ar
          - reddit.com
          - rte.ie
          - www.claro.com.ar
    relabel_configs: &blackbox_relabel
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: {{ blackbox_exporter }}
  - job_name: "blackbox-dns-poc"
    metrics_path: /probe
    params:
      module: [dns_tcp]
    static_configs:
      # the dns prober queries the target as a resolver, so targets are DNS servers (192.168.0.1 is the ISP router)
      - targets:
          - 1.1.1.1
          - 8.8.8.8
          - 9.9.9.9
          - 192.168.0.1
    relabel_configs: *blackbox_relabel
  - job_name: "isp-download"
    scrape_interval: 2h
    scrape_timeout: 60s
    metrics_path: /probe
    params:
      module: [http_download]
    static_configs:
      - targets:
          - http://cachefly.cachefly.net/100mb.test
          - http://mirror.sitsa.com.ar/debian/dists/stable/main/Contents-all.gz
    relabel_configs: *blackbox_relabel
