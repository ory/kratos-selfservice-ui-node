# Deployment Stage Runbook
### Phase 3 — Admin Proxy & Audit
- Deploy Oathkeeper as an API gateway in front of Kratos Admin API.
- Configure `infra/admin-proxy/rules.yaml` to restrict access.
- All admin API calls routed via proxy are logged in `infra/admin-proxy/audit.log`.
