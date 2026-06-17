# 骑星 · 路线九宫格 — 部署文档

> 适用于阿里云 ECS（CentOS / Ubuntu / Alibaba Cloud Linux）

---

## 1. 环境要求

| 项目 | 最低要求 |
|------|----------|
| 操作系统 | CentOS 7+ / Ubuntu 20.04+ / Alibaba Cloud Linux 3 |
| CPU | 1 核 |
| 内存 | 1 GB |
| 磁盘 | 10 GB 可用空间 |
| 网络 | 公网 IP，开放 3000 端口（安全组入方向） |

---

## 2. 安装 Docker

### Ubuntu / Debian

```bash
# 卸载旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 安装依赖
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### CentOS / Alibaba Cloud Linux

```bash
# 卸载旧版本
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 安装依赖
sudo yum install -y yum-utils

# 添加仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 启动 Docker

```bash
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
sudo docker compose version
```

---

## 3. 配置安全组（阿里云控制台）

在阿里云 ECS 控制台 → 安全组 → 入方向规则，添加：

| 协议 | 端口 | 授权对象 | 说明 |
|------|------|----------|------|
| TCP | 3000 | 0.0.0.0/0 | 应用访问端口 |

（如需 HTTPS，建议使用 Nginx 反向代理 + 443 端口，见附录）

---

## 4. 部署应用

### 4.1 上传项目文件

将项目文件夹上传到 ECS：

```bash
# 方式一：scp 上传（在本地执行）
scp -r qixing-route-poster root@<ECS公网IP>:/opt/

# 方式二：git clone（在 ECS 上执行）
cd /opt
git clone <你的仓库地址> qixing-route-poster
```

### 4.2 构建并启动

```bash
cd /opt/qixing-route-poster

# 构建镜像并启动容器
sudo docker compose up -d --build

# 查看运行状态
sudo docker compose ps

# 查看日志
sudo docker compose logs -f
```

### 4.3 验证部署

浏览器访问：`http://<ECS公网IP>:3000`

或使用 curl 验证：

```bash
curl -I http://localhost:3000
# 应返回 HTTP/1.1 200 OK
```

---

## 5. 常用运维命令

```bash
# 查看容器状态
sudo docker compose ps

# 查看实时日志
sudo docker compose logs -f

# 查看最近 100 条日志
sudo docker compose logs --tail=100

# 重启应用
sudo docker compose restart

# 停止应用
sudo docker compose down

# 重新构建并启动（代码更新后）
sudo docker compose up -d --build

# 进入容器调试
sudo docker exec -it qixing-route-poster sh

# 查看资源占用
sudo docker stats qixing-route-poster
```

---

## 6. 更新应用

当代码有更新时：

```bash
cd /opt/qixing-route-poster

# 拉取最新代码（如果用 git）
git pull

# 重新构建并重启
sudo docker compose up -d --build

# 清理旧的未使用镜像（节省磁盘）
sudo docker image prune -f
```

---

## 7. 配置自定义域名

### 7.1 DNS 解析

在域名 DNS 管理后台添加 A 记录：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| @（或 www） | A | ECS 公网 IP |

### 7.2 配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt-get install -y nginx  # Ubuntu
# 或
sudo yum install -y nginx      # CentOS
```

创建配置文件 `/etc/nginx/conf.d/qixing.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    client_max_body_size 200m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启 Nginx：

```bash
sudo nginx -t            # 检查配置
sudo systemctl restart nginx
```

### 7.3 配置 HTTPS（Let's Encrypt）

```bash
# 安装 certbot
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

---

## 8. 放置收款码图片

将微信和支付宝收款码放到项目中：

```bash
# 替换为你自己的收款码图片
cp wechat-pay.png /opt/qixing-route-poster/public/donate/wechat-pay.png
cp alipay.png /opt/qixing-route-poster/public/donate/alipay.png

# 重新构建
cd /opt/qixing-route-poster
sudo docker compose up -d --build
```

---

## 9. 故障排查

### 端口被占用

```bash
# 检查端口占用
sudo lsof -i :3000

# 如果被占用，修改 docker-compose.yml 中的端口映射
# 例如改为 "3001:3000"，然后访问 http://IP:3001
```

### 容器无法启动

```bash
# 查看详细错误
sudo docker compose logs qixing

# 常见问题：内存不足
# 检查内存使用
free -h

# 如果内存不足，可以给 Docker 限制内存
# 在 docker-compose.yml 的 services.qixing 下添加：
#   deploy:
#     resources:
#       limits:
#         memory: 512M
```

### 构建失败

```bash
# 清理缓存重新构建
sudo docker compose build --no-cache
sudo docker compose up -d

# 检查磁盘空间
df -h
```

---

## 10. 项目文件说明

```
qixing-route-poster/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── AppContext.tsx      # 全局状态管理
│   ├── upload/             # 照片上传相关
│   ├── route/              # 路线模板与定制
│   ├── preview/            # 预览与下载
│   ├── common/             # 通用组件
│   └── layout/             # Header/Footer
├── lib/                    # 核心库
│   ├── types.ts            # TypeScript 类型
│   ├── route-templates.ts  # 模板加载
│   ├── route-segmenter.ts  # 路线分段算法
│   ├── canvas-engine.ts    # Canvas 合成引擎
│   └── download.ts         # ZIP 打包下载
├── data/templates/         # 5条路线模板 JSON
├── public/                 # 静态资源
│   ├── donate/             # 收款码（需自行放置）
│   └── thumbnails/         # 模板缩略图
├── Dockerfile              # 容器构建文件
├── docker-compose.yml      # 容器编排
├── .dockerignore           # 构建忽略
└── DEPLOY.md               # 本文档
```
