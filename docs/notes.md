# Env commands

```bash
awk -F '=' '{if ($1 ~ /^#/ || NF < 2) print $0; else print $1"=******"}' .env.local > .env.example
```
