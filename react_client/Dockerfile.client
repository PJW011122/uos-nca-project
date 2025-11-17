##### Client Part #####
# LTS 버전의 node 사용
FROM node:lts AS builder

# workdirectory를 /usr/src/app/react_modules 경로로 설정
# COPY <local> <container>  :  react 파트에 package를 /app/react_modules에 올림
# npm i 실행
# react_modules 파일 전체를 /app/react_modules에 올림
# react 파일 빌드
WORKDIR /usr/src/app/react_client
COPY ./package*.json ./
RUN npm ci --silent --only=production
COPY . .

# 빌드 최적화 
ENV NODE_ENV=production
RUN GENERATE_SOURCEMAP=false npm run build

# 빌드된 결과물을 Nginx가 서빙할 수 있도록
# custom config 설정 (서버에 설치해놓은 nginx에서 gzip 먹이고 가니까 여기선 gzip 미설정)
FROM nginx:stable
RUN rm -f /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/react_client/build /usr/share/nginx/html

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]