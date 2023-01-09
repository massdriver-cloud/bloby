FROM node:18

COPY package.json package.json
RUN yarn install

COPY . .

CMD ["yarn", "start"]
