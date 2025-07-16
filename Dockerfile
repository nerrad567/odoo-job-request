FROM odoo:latest

USER root

# Install system packages and configure locale
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales \
    python3-pip \
 && echo "en_GB.UTF-8 UTF-8" > /etc/locale.gen \
 && locale-gen \
 && update-locale LANG=en_GB.UTF-8 \
 && pip3 install boto3 --break-system-packages \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV LANG=en_GB.UTF-8 \
    LANGUAGE=en_GB:en \
    LC_ALL=en_GB.UTF-8

USER odoo
