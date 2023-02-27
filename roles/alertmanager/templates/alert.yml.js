groups:
- name: Disk-usage
  rules:
  - alert: 'Low data disk space'
    expr: ceil(((node_filesystem_size_bytes{mountpoint!="/boot"} - node_filesystem_free_bytes{mountpoint!="/boot"}) / node_filesystem_size_bytes{mountpoint!="/boot"} * 100)) > 95
    labels:
      severity: 'critical'
    annotations:
      title: "Disk Usage"
      description: {% raw %}'Partition : {{$labels.mountpoint}}'{% endraw %}

      summary: {% raw %}"Disk usage is `{{humanize $value}}%`"{% endraw %}

      host: {% raw %}"{{$labels.instance}}"{% endraw %}


- name: Memory-usage
  rules:
  - alert: 'High memory usage'
    expr: ceil((((node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes) / node_memory_MemTotal_bytes) * 100)) > 80
    labels:
      severity: 'critical'
    annotations:
      title: "Memory Usage"
      description: 'Memory usage threshold set to `80%`.'
      summary: {% raw %}"Memory usage is `{{humanize $value}}%`"{% endraw %}

      host: {% raw %}"{{$labels.instance}}"{% endraw %}


- name: Hardware alerts
  rules:
  - alert: Node down
    expr: {% raw %}up{job="pi-nodes"} == 0{% endraw %}
    
    for: 5m
    labels:
      severity: critical
      alertmanager: {{ ansible_hostname | upper }}
    annotations:
      title: Node {% raw %}{{ $labels.instance }} is down{% endraw %}

      description: FAILED to scrape {% raw %}{{ $labels.job }} on {{ $labels.instance }} for 5 minutes. Node seems down, please check it ASAP.{% endraw %}

