# Zero Monitoring
Ansible playbook &amp; roles for monitoring setup for zero. As was having issue with Pi 4 loosing network connectivity set this up as quick solution to monitor.

This will update apt, populate packages and then install Prometheus & associated config and the Alertmanager & associated config.

## Config
At the minute the configs are fairly static except the slack_api_url. Hosts and some others vars in the various config files are set via vars values. The vars.yaml is encrypted via Ansible-vault.


