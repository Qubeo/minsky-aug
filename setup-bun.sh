#!/bin/bash
mkdir -p .bin
cat > .bin/npx << 'EOF'
#!/bin/bash
exec bunx "$@"
EOF
chmod +x .bin/npx
export PATH="$(pwd)/.bin:$PATH"
