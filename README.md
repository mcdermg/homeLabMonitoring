# Zero Monitoring
Ansible playbook &amp; roles for the monitoring setup on the Pi Zero. Originally set up as a quick solution to monitor a Pi 4 that kept losing network connectivity.

This will update apt, populate packages and then install Prometheus & associated config, AlertManager & associated config, and Gatus.

## Config
At the minute the configs are fairly static except the Slack hooks. Hosts and some other vars in the various config files are set via vars values. The `vars.yaml` is encrypted via Ansible-vault.

### Target single Hosts
Via ansible:

``` bash
ansible-playbook playbook.yaml --limit zero-2
```

Or if you want to only run a specific role you can also target tags.

``` bash
ansible-playbook playbook.yaml --limit zero-2 --tags "gatus"
```

### Force config

There are 3 vars set in the `playbook.yaml`:

- `force_prom_config`
- `force_alert_config`
- `force_gatus_config`

All are booleans and steps in their roles have conditionals. It's focused on forcing copying of config files over when editing them and you don't need all the install steps. All steps have checks in place and likely will skip, but having this toggle is expedient for fast config updates.

### Slack

AlertManager is set to send alerts to Slack via a hook. This is in the encrypted `vars.yaml`. This Slack application can be accessed [here](https://api.slack.com/apps/A03N9CZGHEX/install-on-team?).

## Gatus

Gatus is the status dashboard, served on port 80 of the Zero. It checks the ISP router, the MikroTik, the switch, the Proxmox nodes, the k3s nodes and services, and external sites.

- The binary is built in the `celestial-industries-gatus` repo and committed here as `roles/gatus/files/gatus-linux-arm.zip`.
- It installs to `/home/pi/repos/gatus/` and runs as the `gatus` systemd service.
- The config template is `roles/gatus/templates/config.yaml.js`. Endpoint IPs must follow the lab IP layout in the `mikrotik-hapac2` repo.
- Storage is SQLite in `/home/pi/repos/gatus/data/`, local to the Zero. Don't point it at a database inside the lab, as the monitor must keep working when the lab is down.
- Alerts go to Slack via `GATUS_SLACK_HOOK` in the encrypted `vars.yaml`.

To push a config change, set `force_gatus_config: true` and run the playbook with `--tags "gatus"`.
