FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node package.json ./
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node src/ ./src/
RUN find ./src -type d -exec chmod 755 {} + && find ./src -type f -exec chmod 644 {} +
USER node
EXPOSE 8787
CMD ["node","src/index.mjs"]
