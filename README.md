# Zero Monitoring
Ansible playbook &amp; roles for the monitoring setup on the Pi Zero. Originally set up as a quick solution to monitor a Pi 4 that kept losing network connectivity.

This will update apt, populate packages and then install Prometheus & associated config, AlertManager & associated config, and Gatus.

## Config
At the minute the configs are fairly static. Scrape targets are set in the templates; `vars.yaml` (encrypted via Ansible-vault) only holds the Slack hooks, scrape/evaluation intervals and the rule file name.

### Pre-commit
Hooks are in `.pre-commit-config.yaml` (YAML checks, ansible-lint, gitleaks). Set up once with `pre-commit install`.

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

## Prometheus

Prometheus runs on port 9090 of the Zero. The Zero is the external monitor: it sits on the ISP network, outside the lab, so it keeps scraping and alerting when the lab is down. The k3s cluster has its own Prometheus and Grafana for the internal view, and that Grafana uses this Prometheus as a data source for the ISP dashboard.

Jobs, from `roles/prometheus/templates/prometheus.yml.js`:

| Job | Scrapes | Notes |
| --- | ------- | ----- |
| `prometheus` | `localhost:9090` | Prometheus itself |
| `node` | `localhost:9100` | The Zero's own node_exporter |
| `pi-nodes` | `192.168.1.250`, `.251` (pve01, pve02), `.241` (Pi 4), `.242` (Pi 3), all `:9100` | Lab node_exporters, for history and Grafana. No alerts: lab hosts belong to Gatus, the k3s Alertmanager and Pulse |
| `blackbox-icmp-poc` | Ping to 8 sites (`1.1.1.1`, `bbc.com`, `rte.ie`, ...) | Via Blackbox |
| `blackbox-dns-poc` | DNS query to `1.1.1.1`, `8.8.8.8`, `9.9.9.9`, `192.168.0.1` | Via Blackbox. The `dns` prober queries the target as a resolver, so targets must be DNS servers |
| `isp-download` | 100 MiB download from CacheFly and a 38 MB file from the SiTSA mirror (Argentina), every 2 h | Via Blackbox, for ISP throughput. A single stream from a far server (e.g. OVH, ~246 ms) reads far below the line, so targets must be nearby |

The Blackbox jobs call the `monitor_isp` Blackbox Exporter container on the MikroTik at `192.168.1.249:9115` (set once at the top of the template). Its modules (`icmp_ipv4`, `dns_tcp`, `http_download`) are defined in `blackbox.yaml` in the `Celestial-Industries/monitor_isp` repo. The `blackbox-*-poc` job names match that repo's `blackbox-dashboard.json`, so don't rename them without updating the dashboard.

The Zero reaches the lab through its `trusted_devices` entry in the `mikrotik-hapac2` firewall; there is no separate rule for 9115 or 9100.

To push a config change:

``` bash
ansible-playbook playbook.yaml --limit zero-2 --tags prometheus -e force_prom_config=true
```

## Alerts

Rules are in `roles/alertmanager/templates/alert.yml.js` and go to Slack (see Slack above). The Zero only alerts on what the k3s cluster can't see, so the two Alertmanagers never cover the same thing:

| Group | Alert | Fires when |
| ----- | ----- | ---------- |
| Zero | `Low data disk space`, `High memory usage` | The Zero's own disk > 95% or memory > 80% (`job="node"` only) |
| ISP | `Internet down` | No ICMP target answers for 3 min. Slack gets it once the connection is back |
| ISP | `Internet packet loss` | Under 80% of ICMP probes succeed over 10 min |
| ISP | `Internet latency high` | Average ICMP round trip > 150 ms for 15 min (normally 30-50 ms) |
| ISP | `DNS resolver failing` | A `blackbox-dns-poc` resolver fails for 10 min |
| ISP | `ISP probes not running` | The Blackbox exporter on the MikroTik is unreachable for 10 min |

Lab hosts are covered elsewhere: Gatus (up/down), the k3s Alertmanager (CPU, memory, disk) and Pulse (Proxmox detail).

To push a rule change (the role also reloads Prometheus, which evaluates the rules):

``` bash
ansible-playbook playbook.yaml --limit zero-2 --tags alertmanager -e force_alert_config=true
```

## Gatus

Gatus is the status dashboard, served on port 80 of the Zero. It checks the ISP router, the MikroTik, the switch, the Proxmox nodes, the k3s nodes and services, and external sites.

- The binary is built in the `celestial-industries-gatus` repo and committed here as `roles/gatus/files/gatus-linux-arm.zip`.
- It installs to `/home/pi/repos/gatus/` and runs as the `gatus` systemd service.
- The config template is `roles/gatus/templates/config.yaml.js`. Endpoint IPs must follow the lab IP layout in the `mikrotik-hapac2` repo.
- Storage is SQLite in `/home/pi/repos/gatus/data/`, local to the Zero. Don't point it at a database inside the lab, as the monitor must keep working when the lab is down.
- Alerts go to Slack via `GATUS_SLACK_HOOK` in the encrypted `vars.yaml`.

To push a config change, set `force_gatus_config: true` and run the playbook with `--tags "gatus"`.

## SSH

The `ssh` role moves sshd to port 2222. The Proxmox nodes use 2222 as their default SSH port, and `pvecm qdevice setup` has no port option, so the Zero has to match to act as the QDevice. The playbook checks whether 2222 is open before gathering facts and connects on 22 if it isn't, so the same command works on a fresh Pi and after the move. Don't pass `-e ansible_port=...`: extra vars override that check.
