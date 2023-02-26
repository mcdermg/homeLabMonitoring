global:
  resolve_timeout: 1m
  slack_api_url: {{ SLACK_API_URL }}
route:
  receiver: 'slack-notifications'
receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#alerts'
    send_resolved: true
    icon_url: https://avatars3.githubusercontent.com/u/3380462
templates:
- notifications.tmpl