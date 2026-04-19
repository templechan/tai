cd /usr/local/src
rm -rf /usr/local/src/tai

if ! command -v git &> /dev/null; then
    dnf install -y git
    git config --global user.email "templechan@126.com"
    git config --global user.name "templechan"
fi

# 设置 GitHub 国内镜像源
# git config --global url."https://bgithub.xyz/".insteadOf https://github.com/
# 如果失效，则删除旧的，设置的新的，记得先测试下是否有效
# git config --global --unset url."https://bgithub.xyz/".insteadOf https://github.com/
# git config --global url."https://kkgithub.com/".insteadOf https://github.com/
git clone -b main https://github.com/templechan/tai.git

if [ -d /usr/local/src/tai ] && [ -n "$(ls -A /usr/local/src/tai)" ]; then
    cd /usr/local/src/tai
    if ! command -v mogrify &> /dev/null; then
        # 安装图片压缩包 ImageMagick
        dnf install -y ImageMagick bc parallel
        # 配置ImageMagick策略文件
        sed -i '/<policy domain="coder" rights=".*" pattern="PNG,JPG,JPEG,WEBP"/d;/<policymap>/a \  <policy domain="coder" rights="read|write" pattern="PNG,JPG,JPEG,WEBP" />;s/<policy domain="resource" name="memory" value="[^"]*"/<policy domain="resource" name="memory" value="256MiB"/;s/<policy domain="resource" name="disk" value="[^"]*"/<policy domain="resource" name="disk" value="1GiB"/;s/<policy domain="resource" name="width" value="[^"]*"/<policy domain="resource" name="width" value="8KP"/;s/<policy domain="resource" name="height" value="[^"]*"/<policy domain="resource" name="height" value="8KP"/;s/<policy domain="resource" name="thread" value="[^"]*"/<policy domain="resource" name="thread" value="2"/;s/<policy domain="resource" name="throttle" value="[^"]*"/<policy domain="resource" name="throttle" value="1"/;s/<policy domain="resource" name="map" value="[^"]*"/<policy domain="resource" name="map" value="256MiB"/' /etc/ImageMagick-7/policy.xml
    fi

    # 手动压缩图片资源（会覆盖源文件，注意保留源文件）
    # 1 图片大小判断 >100KB 才压缩
    # 2 动态质量计算算法 75 - 20*l(...)
    # 3 质量限制 15~60
    # 4 PNG / JPG / WebP 压缩参数
    # 5 统计节省空间算法
    # 6 并行数 -j 2

    # 进度交互版
    # start=$SECONDS; find ./public/assets/images/ \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -type f -print0 | parallel -0 -j 2 --bar 'f="{}";old_size=$(stat -c %s "$f");if [ $old_size -gt 102400 ]; then q=$(echo "scale=0;80-40*l($old_size/102400)/l(10)" | bc -l | awk "{print int(\$1+0.5)}");q=$((q<15?15:q>60?60:q));ext="${f##*.}";case "$ext" in png) mogrify -strip -quality $q -define png:compression-level=9 -colors 128 "$f" 2>/dev/null ;; jpg|jpeg) mogrify -strip -quality $q -sampling-factor 4:2:0 -density 72x72 "$f" 2>/dev/null ;; webp) mogrify -strip -quality $((q-5)) -define webp:method=6 "$f" 2>/dev/null ;; esac;new_size=$(stat -c %s "$f");save=$((old_size-new_size));echo "$save" >> /tmp/img_save.txt;fi'; touch /tmp/img_save.txt; total_save=$(awk '{sum+=$1}END{print sum+0}' /tmp/img_save.txt 2>/dev/null); count=$(wc -l < /tmp/img_save.txt 2>/dev/null); rm -f /tmp/img_save.txt; cost=$((SECONDS - start)); min=$((cost / 60)); sec=$((cost % 60)); echo -e "\n\033[1;32m=== 压缩完成 ===\033[0m"; echo "✅ 压缩数量：${count:-0} 张"; echo "✅ 节省空间：$((total_save/1024)) KB ($((total_save/1024/1024)) MB)"; echo -e "✅ 耗时：${min}分${sec}秒"; echo -e "\033[1;32m================\033[0m"
    start=$SECONDS; touch /tmp/img_save.txt; find ./public/assets/images/ \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -type f -print0 | parallel -0 -j 2 'f="{}";old_size=$(stat -c %s "$f");if [ $old_size -gt 102400 ]; then q=$(echo "scale=0;80-40*l($old_size/102400)/l(10)" | bc -l | awk "{print int(\$1+0.5)}");q=$((q<15?15:q>60?60:q));ext="${f##*.}";case "$ext" in png) mogrify -strip -quality $q -define png:compression-level=9 -colors 128 "$f" 2>/dev/null ;; jpg|jpeg) mogrify -strip -quality $q -sampling-factor 4:2:0 -density 72x72 "$f" 2>/dev/null ;; webp) mogrify -strip -quality $((q-5)) -define webp:method=6 "$f" 2>/dev/null ;; esac;new_size=$(stat -c %s "$f");save=$((old_size-new_size));echo "$save" >> /tmp/img_save.txt;fi' 2>/dev/null; total_save=$(awk '{sum+=$1}END{print sum+0}' /tmp/img_save.txt 2>/dev/null); count=$(wc -l < /tmp/img_save.txt 2>/dev/null); rm -f /tmp/img_save.txt; cost=$((SECONDS-start)); min=$((cost/60)); sec=$((cost%60)); echo -e "\n=== 图片压缩完成 ==="; echo "压缩数量：${count:-0} 张"; echo "节省空间：$((total_save/1024)) KB ($((total_save/1024/1024)) MB)"; echo "耗时：${min}分${sec}秒"; echo "===================="
    
    
    if ! command -v pnpm &> /dev/null; then
        corepack enable
        corepack prepare pnpm@latest --activate
    fi
    
    pnpm approve-builds --all
    pnpm install --frozen-lockfile
    pnpm build

    if ! command -v docker &> /dev/null; then
        # 卸载旧版 Docker
        dnf remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine
        # 自动启用仓库
        sed -i 's/enabled=0/enabled=1/g' /etc/yum.repos.d/OpenCloudOS.repo
        # 保存后，清除重建缓存
        dnf clean all && dnf makecache

        # 设置 Docker 国内软件源
        dnf install -y dnf-plugins-core
        # dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        dnf config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

        # 安装 Docker
        dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        # 启动 Docker
        systemctl start docker
        # 设置 Docker 自启
        systemctl enable docker
    fi
    # 设置 Docker 国内镜像代理
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
    systemctl daemon-reload
    
    docker compose up -d --build
fi