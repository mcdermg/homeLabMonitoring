# The monitoring Pi only alerts on what the k3s cluster can't see: itself and the ISP (LAB-122, LAB-125).
# Lab hosts belong to Gatus (up/down), the k3s Alertmanager (resources) and Pulse (Proxmox detail);
# the pi-nodes scrape stays for history and Grafana
groups:
- name: Monitoring
  rules:
  - alert: 'Low data disk space'
    expr: ceil(((node_filesystem_size_bytes{job="node",mountpoint!="/boot"} - node_filesystem_free_bytes{job="node",mountpoint!="/boot"}) / node_filesystem_size_bytes{job="node",mountpoint!="/boot"} * 100)) > 95
    labels:
      severity: 'critical'
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: "Disk Usage"
      description: {% raw %}'Partition : {{$labels.mountpoint}}'{% endraw %}

      summary: {% raw %}"Disk usage is `{{humanize $value}}%`"{% endraw %}

      host: {% raw %}"{{$labels.instance}}"{% endraw %}


  - alert: 'High memory usage'
    expr: ceil((((node_memory_MemTotal_bytes{job="node"} - node_memory_MemFree_bytes{job="node"} - node_memory_Buffers_bytes{job="node"} - node_memory_Cached_bytes{job="node"}) / node_memory_MemTotal_bytes{job="node"}) * 100)) > 80
    labels:
      severity: 'critical'
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: "Memory Usage"
      description: 'Memory usage threshold set to `80%`.'
      summary: {% raw %}"Memory usage is `{{humanize $value}}%`"{% endraw %}

      host: {% raw %}"{{$labels.instance}}"{% endraw %}


# Probes run from the Blackbox container on the MikroTik (monitor_isp). Normal: ~30-50 ms RTT, 98-99% success.
# When the internet is fully down, Slack gets the alert once the connection is back
- name: ISP
  rules:
  - alert: Internet down
    expr: max(probe_success{job="blackbox-icmp-poc"}) == 0
    for: 3m
    labels:
      severity: critical
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: Internet down
      description: No ICMP probe target has answered for 3 minutes.

  - alert: Internet packet loss
    expr: avg(avg_over_time(probe_success{job="blackbox-icmp-poc"}[10m])) < 0.8
    for: 10m
    labels:
      severity: warning
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: Internet packet loss
      description: {% raw %}Only {{ $value | humanizePercentage }} of ICMP probes succeeded over the last 10 minutes.{% endraw %}


  - alert: Internet latency high
    expr: avg(avg_over_time(probe_icmp_duration_seconds{job="blackbox-icmp-poc",phase="rtt"}[10m])) > 0.15
    for: 15m
    labels:
      severity: warning
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: Internet latency high
      description: {% raw %}Average ICMP round trip is {{ $value | humanizeDuration }} (normally 30-50 ms).{% endraw %}


  - alert: DNS resolver failing
    expr: probe_success{job="blackbox-dns-poc"} == 0
    for: 10m
    labels:
      severity: warning
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: {% raw %}DNS resolver {{ $labels.instance }} failing{% endraw %}

      description: {% raw %}DNS queries to {{ $labels.instance }} have failed for 10 minutes.{% endraw %}


  # Without the exporter every ISP alert above goes quiet
  - alert: ISP probes not running
    expr: max(up{job=~"blackbox-.*"}) == 0
    for: 10m
    labels:
      severity: warning
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: ISP probes not running
      description: The Blackbox exporter on the MikroTik (192.168.1.249:9115) hasn't answered for 10 minutes.
