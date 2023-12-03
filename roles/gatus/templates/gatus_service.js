[Unit]
Description=Gatus Dashboard Service
After=network.target

[Service]
ExecStart=/home/pi/repos/gatus/gatus-linux-arm
WorkingDirectory=/home/pi/repos/gatus/
User=root
Restart=always

[Install]
WantedBy=multi-user.target
