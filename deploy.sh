#!/bin/bash
##############################################################################
# 项目一键部署脚本 (OpenCloudOS 9 / Next.js 服务端构建版)
# 功能：代码拉取 → 图片压缩 → Node环境安装 → 项目构建 → Docker部署
# 特性：严格错误捕获、失败立即退出、全流程可视化、适配GitHub Actions
##############################################################################

# ====================== 脚本核心配置：严格错误模式（必开） ======================
# set -e：任意命令执行失败，脚本立即终止
# set -u：使用未定义变量，脚本立即终止
# set -o pipefail：管道命令中任意环节失败，脚本立即终止
set -euo pipefail

# 定义固定常量（方便后期修改，统一管理）
readonly PROJECT_DIR="/usr/local/src/tai"    # 项目部署目录
readonly NODE_VERSION="v20.18.0"              # Node.js版本（Next.js要求≥20.9.0）
readonly NODE_BIN_URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz"

# 清屏+输出脚本标题
clear
echo -e "============================================================"
echo -e "           Next.js 项目自动化部署脚本（服务端构建）"
echo -e "============================================================"
echo -e ""

# ==============================================
# 【步骤 1/8】基础环境清理：删除旧项目目录
# ==============================================
echo -e "\033[1;34m[1/8] 正在清理旧项目环境...\033[0m"
cd /usr/local/src
# 强制删除旧目录，避免残留文件冲突
rm -rf "${PROJECT_DIR}"
echo -e "\033[1;32m✅ 旧目录清理完成\033[0m"

# ==============================================
# 【步骤 2/8】安装Git（如未安装）+ 配置用户信息
# ==============================================
echo -e "\033[1;34m[2/8] 检查并安装Git工具...\033[0m"
if ! command -v git &> /dev/null; then
    echo "未检测到Git，开始安装..."
    dnf install -y git
    # 配置Git全局用户（提交代码/拉取代码必备）
    git config --global user.email "templechan@126.com"
    git config --global user.name "templechan"
    echo -e "\033[1;32m✅ Git安装&配置完成\033[0m"
else
    echo -e "\033[1;32m✅ Git已存在，跳过安装\033[0m"
fi

# ==============================================
# 【步骤 3/8】克隆项目代码（核心步骤：失败直接退出）
# ==============================================
# 设置 GitHub 国内镜像源
# git config --global url."https://bgithub.xyz/".insteadOf https://github.com/
# 如果失效，则删除旧的，设置的新的，记得先测试下是否有效
# git config --global --unset url."https://bgithub.xyz/".insteadOf https://github.com/
# git config --global url."https://kkgithub.com/".insteadOf https://github.com/
echo -e "\033[1;34m[3/8] 正在拉取GitHub代码（main分支）...\033[0m"
# 判断git clone是否执行成功，失败则退出脚本并返回错误码
if ! git clone -b main https://github.com/templechan/tai.git "${PROJECT_DIR}"; then
    echo -e "\033[1;31m❌ 代码拉取失败！部署终止，请检查网络/仓库地址\033[0m"
    exit 1
fi
echo -e "\033[1;32m✅ 代码拉取成功\033[0m"

# 进入项目目录（代码拉取成功才会执行到这里）
cd "${PROJECT_DIR}"

# ==============================================
# 【步骤 4/8】安装图片压缩依赖（ImageMagick）
# ==============================================
echo -e "\033[1;34m[4/8] 检查并安装图片压缩工具...\033[0m"
if ! command -v mogrify &> /dev/null; then
    echo "安装ImageMagick+依赖包..."
    dnf install -y ImageMagick bc parallel
    # 配置ImageMagick安全策略（开启图片读写权限+资源限制）
    sed -i '/<policy domain="coder" rights=".*" pattern="PNG,JPG,JPEG,WEBP"/d;/<policymap>/a \  <policy domain="coder" rights="read|write" pattern="PNG,JPG,JPEG,WEBP" />;s/<policy domain="resource" name="memory" value="[^"]*"/<policy domain="resource" name="memory" value="256MiB"/;s/<policy domain="resource" name="disk" value="[^"]*"/<policy domain="resource" name="disk" value="1GiB"/;s/<policy domain="resource" name="width" value="[^"]*"/<policy domain="resource" name="width" value="8KP"/;s/<policy domain="resource" name="height" value="[^"]*"/<policy domain="resource" name="height" value="8KP"/;s/<policy domain="resource" name="thread" value="[^"]*"/<policy domain="resource" name="thread" value="2"/;s/<policy domain="resource" name="throttle" value="[^"]*"/<policy domain="resource" name="throttle" value="1"/;s/<policy domain="resource" name="map" value="[^"]*"/<policy domain="resource" name="map" value="256MiB"/' /etc/ImageMagick-7/policy.xml
    echo -e "\033[1;32m✅ 图片压缩工具安装完成\033[0m"
else
    echo -e "\033[1;32m✅ 图片压缩工具已存在，跳过安装\033[0m"
fi

# ==============================================
# 【步骤 5/8】自动批量压缩项目图片（智能算法）
# ==============================================
# 进度交互版
# start=$SECONDS; find ./public/assets/images/ \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -type f -print0 | parallel -0 -j 2 --bar 'f="{}";old_size=$(stat -c %s "$f");if [ $old_size -gt 102400 ]; then q=$(echo "scale=0;80-40*l($old_size/102400)/l(10)" | bc -l | awk "{print int(\$1+0.5)}");q=$((q<15?15:q>60?60:q));ext="${f##*.}";case "$ext" in png) mogrify -strip -quality $q -define png:compression-level=9 -colors 128 "$f" 2>/dev/null ;; jpg|jpeg) mogrify -strip -quality $q -sampling-factor 4:2:0 -density 72x72 "$f" 2>/dev/null ;; webp) mogrify -strip -quality $((q-5)) -define webp:method=6 "$f" 2>/dev/null ;; esac;new_size=$(stat -c %s "$f");save=$((old_size-new_size));echo "$save" >> /tmp/img_save.txt;fi'; touch /tmp/img_save.txt; total_save=$(awk '{sum+=$1}END{print sum+0}' /tmp/img_save.txt 2>/dev/null); count=$(wc -l < /tmp/img_save.txt 2>/dev/null); rm -f /tmp/img_save.txt; cost=$((SECONDS - start)); min=$((cost / 60)); sec=$((cost % 60)); echo -e "\n\033[1;32m=== 压缩完成 ===\033[0m"; echo "✅ 压缩数量：${count:-0} 张"; echo "✅ 节省空间：$((total_save/1024)) KB ($((total_save/1024/1024)) MB)"; echo -e "✅ 耗时：${min}分${sec}秒"; echo -e "\033[1;32m================\033[0m"
echo -e "\033[1;34m[5/8] 开始自动压缩项目图片资源...\033[0m"
# 记录压缩开始时间
start=$SECONDS
# 创建临时文件统计压缩数据
touch /tmp/img_save.txt
# 核心压缩逻辑：仅压缩>100KB图片、动态质量、并行压缩、静默执行
find ./public/assets/images/ \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -type f -print0 | parallel -0 -j 2 'f="{}";old_size=$(stat -c %s "$f");if [ $old_size -gt 102400 ]; then q=$(echo "scale=0;80-40*l($old_size/102400)/l(10)" | bc -l | awk "{print int(\$1+0.5)}");q=$((q<15?15:q>60?60:q));ext="${f##*.}";case "$ext" in png) mogrify -strip -quality $q -define png:compression-level=9 -colors 128 "$f" 2>/dev/null ;; jpg|jpeg) mogrify -strip -quality $q -sampling-factor 4:2:0 -density 72x72 "$f" 2>/dev/null ;; webp) mogrify -strip -quality $((q-5)) -define webp:method=6 "$f" 2>/dev/null ;; esac;new_size=$(stat -c %s "$f");save=$((old_size-new_size));echo "$save" >> /tmp/img_save.txt;fi' 2>/dev/null

# 统计压缩结果
total_save=$(awk '{sum+=$1}END{print sum+0}' /tmp/img_save.txt 2>/dev/null)
count=$(wc -l < /tmp/img_save.txt 2>/dev/null)
rm -f /tmp/img_save.txt
cost=$((SECONDS-start))
min=$((cost/60))
sec=$((cost%60))

# 输出压缩统计信息
echo -e "\033[1;32m=== 图片压缩完成 ===\033[0m"
echo -e "压缩数量：${count:-0} 张"
echo -e "节省空间：$((total_save/1024)) KB ($((total_save/1024/1024)) MB)"
echo -e "耗时：${min}分${sec}秒"
echo -e "\033[1;32m====================\033[0m"

# ==============================================
# 【步骤 6/8】安装Node.js + pnpm包管理器
# ==============================================
echo -e "\033[1;34m[6/8] 检查并安装Node.js运行环境...\033[0m"
if ! command -v node &> /dev/null; then
    echo "安装官方Node.js ${NODE_VERSION}..."
    # 下载官方二进制包（不依赖系统源，100%兼容）
    curl -fsSL "${NODE_BIN_URL}" -o node.tar.xz
    # 解压到系统全局目录（自动配置环境变量）
    tar -xf node.tar.xz --strip-components=1 -C /usr/local
    # 清理压缩包
    rm -f node.tar.xz
    echo -e "\033[1;32m✅ Node.js安装完成\033[0m"
else
    echo -e "\033[1;32m✅ Node.js已存在，跳过安装\033[0m"
fi

# 安装/更新pnpm（Next.js项目专用包管理器）
echo "安装pnpm包管理器..."
npm install -g pnpm --force
echo -e "\033[1;32m✅ pnpm安装完成\033[0m"

# ==============================================
# 【步骤 7/8】项目构建：配置环境变量 + 安装依赖 + 编译
# ==============================================
echo -e "\033[1;34m[7/8] 开始构建Next.js项目...\033[0m"
# ====================== 核心环境变量（必配） ======================
# 强制sharp下载预编译包，跳过本地编译（解决libvips依赖报错）
export SHARP_DOWNLOAD_BINARY=true

# 允许原生包编译 + 安装项目依赖 + 生产构建
echo "安装项目依赖..."
pnpm approve-builds --all
pnpm install --frozen-lockfile

echo "开始生产构建..."
pnpm build
echo -e "\033[1;32m✅ 项目构建完成\033[0m"

# ==============================================
# 【步骤 8/8】Docker环境安装 + 配置 + 启动服务
# ==============================================
echo -e "\033[1;34m[8/8] 检查并配置Docker容器环境...\033[0m"
if ! command -v docker &> /dev/null; then
    echo "卸载旧版Docker组件..."
    dnf remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

    echo "启用系统软件仓库..."
    sed -i 's/enabled=0/enabled=1/g' /etc/yum.repos.d/OpenCloudOS.repo
    dnf clean all && dnf makecache

    echo "配置阿里云Docker镜像源..."
    dnf install -y dnf-plugins-core
    dnf config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

    echo "安装Docker引擎..."
    dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo "启动Docker并设置开机自启..."
    systemctl start docker
    systemctl enable docker
    echo -e "\033[1;32m✅ Docker安装完成\033[0m"
else
    echo -e "\033[1;32m✅ Docker已存在，跳过安装\033[0m"
fi

# 配置Docker国内镜像加速（解决拉取镜像慢/失败）
echo "配置Docker镜像代理..."
tee /etc/docker/daemon.json <<EOF
{
"registry-mirrors": [
    "https://docker.1ms.run",
    "https://dockerproxy.net",
    "https://proxy.vvvv.ee",
    "https://dockerproxy.link"
]
}
EOF
# 重载Docker配置
systemctl daemon-reload
echo -e "\033[1;32m✅ Docker镜像配置完成\033[0m"

# 启动项目容器（构建镜像+后台运行）
echo -e "\033[1;34m正在启动项目服务...\033[0m"
docker compose up -d --build

# ==============================================
# 部署完成：全流程成功结束
# ==============================================
echo -e ""
echo -e "============================================================"
echo -e "\033[1;32m🎉 项目部署全部完成！服务已后台运行\033[0m"
echo -e "============================================================"