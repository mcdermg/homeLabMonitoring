# Zero Monitoring
Ansible playbook &amp; roles for monitoring setup for zero. As was having issue with Pi 4 loosing network connectivity set this up as quick solution to monitor.

This will update apt, populate packages and then install Prometheus & associated config and AlertManager & associated config.

## Config
At the minute the configs are fairly static except the slack_api_url. Hosts and some others vars in the various config files are set via vars values. The `vars.yaml` is encrypted via Ansible-vault.

### Target single Hosts
Via ansible:

``` bash
ansible-playbook playbook.yaml --limit zero-2
```

Or if wnat to only runa  specific role can also target tags.

``` bash
ansible-playbook playbook.yaml --limit zero-2 --tags "gatus"
```

### Force config

There are 3 vars set in the `playbook.yaml`:

- `force_prom_config`
- `force_alert_config`
- `force_gatus_config`

All ae booleans and steps in their roles have conditionals. Its focused on forcing copying of conmfiog files over if editing them and dont need all install steps. All steps have checks in place and likly will skip but having this toggle is exediant for fast config update.

### Slack

AlertManager is set to send alerts to slack via a hook. This is in the encrypted `vars.yaml`. This Slack application can be accessed [here](https://api.slack.com/apps/A03N9CZGHEX/install-on-team?).
