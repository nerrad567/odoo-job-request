FROM odoo:latest

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jre \
    && pip3 install jingtrang boto3==1.35.24 --break-system-packages \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy custom configuration and addons
COPY ./config/odoo.conf /etc/odoo/odoo.conf
COPY ./addons /mnt/extra-addons

# Set permissions for Odoo user
RUN chown -R odoo:odoo /etc/odoo /mnt/extra-addons

USER odoo