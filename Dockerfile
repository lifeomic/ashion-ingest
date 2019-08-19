FROM node:12-alpine

ENV USR_BIN /usr/local/bin

RUN apk add --no-cache \
  dumb-init \
  git \
  autoconf \
  make \
  gcc \
  g++ \
  zlib-dev \
  bzip2-dev \
  xz-dev

RUN mkdir -p /opt/app
WORKDIR /tmp

COPY target/build/ /opt/app/

# -> /usr/local/bin/bgzip
# -> /usr/local/bin/tabix
RUN set -ex \
  && cd /opt \
  && git clone --depth 1 --branch 1.8 https://github.com/samtools/htslib \
  && git clone --depth 1 --branch 1.8 https://github.com/samtools/samtools \
  && git clone --depth 1 --branch 1.8 https://github.com/samtools/bcftools \
  && cd htslib \
  && autoconf -Wno-syntax \
  && make clean \
  && make \
  && cp bgzip $USR_BIN \
  && cd /opt/bcftools \
  && autoconf -Wno-syntax \
  && make \
  && cp bcftools $USR_BIN \
  && rm -fr /opt/htslib /opt/samtools /opt/bcftools

ENTRYPOINT ["node", "/opt/app/src/index.js"]