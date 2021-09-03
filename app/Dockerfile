#
# ---- Dependencies ----
# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:12-slim AS base
WORKDIR /usr/src/app
COPY . ./
RUN npm install

#---- build ----

FROM base as build
ARG TARGET_ENV
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm run build
RUN rm -rf ./node_modules
RUN npm install -–production


#---- Release ----
FROM node:12-slim AS release
WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install -y \
    fonts-liberation \
    gconf-service \
    libappindicator1 \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libfontconfig1 \
    libgbm-dev \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libicu-dev \
    libjpeg-dev \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng-dev \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    gconf-service \
    xdg-utils \
    libasound2 \ 
    libnss3 \
    libxss1
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && apt-get install -f 
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && apt install -y ./google-chrome-stable_current_amd64.deb

# copy production node_modules
COPY --from=build /usr/src/app/node_modules ./node_modules
# copy app sources
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]