# Zero Monitoring
Ansible playbook &amp; roles for monitoring setup for zero. As was having issue with Pi 4 loosing network connectivity set this up as quick solution to monitor.

This will update apt, populate packages and then install Prometheus & associated config and the AlertManager & associated config.

## Config
At the minute the configs are fairly static except the slack_api_url. Hosts and some others vars in the various config files are set via vars values. The vars.yaml is encrypted via Ansible-vault.

### Target single Hosts
Via ansible:

``` bash
ansible-playbook playbook.yaml --limit zero-2
```
### Slack

AlertManager is set to send alerts to slack via a hook. This is in the encrypted `vars.yaml`. This Slack application can be accessed [here](https://api.slack.com/apps/A03N9CZGHEX/install-on-team?).
