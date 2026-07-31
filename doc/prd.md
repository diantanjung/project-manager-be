# Product Requirements Document - Project Manager

> Status: source of truth lintas frontend dan backend Node.js, Laravel, dan Golang  
> Versi: 1.2  
> Tanggal audit frontend: 29 Juli 2026  
> Referensi: `../project-manager-fe/src`, backend Node.js legacy, `../project-manager-laravel/doc`, dan `../project-manager-go/doc`

PRD ini dipecah menjadi beberapa file kecil agar tiap area bisa dibaca dan dikerjakan lebih fokus.

| Dokumen | Isi |
| --- | --- |
| [Overview dan Scope](prd/01-overview.md) | Ringkasan produk, problem, tujuan, persona, dan scope |
| [Current Frontend Feature Audit](prd/02-current-frontend-audit.md) | Fitur yang sudah terlihat di frontend dan kebutuhan backend terkait |
| [Domain, Rules, dan Non-Functional Requirements](prd/03-domain-rules-nfr.md) | Model domain, enum, aturan bisnis, dan kebutuhan teknis |
| [Feature Requirements](prd/04-feature-requirements.md) | Requirement per area produk |
| [Roadmap dan Gap](prd/05-roadmap-gaps.md) | Gap implementasi, prioritas, dan acceptance criteria |
| [Deployment dan Infrastructure](prd/06-deployment-infrastructure.md) | Target hosting, database, storage, environment variable, dan operasional deploy |

## Cara Pakai

- Mulai dari [Overview dan Scope](prd/01-overview.md) untuk memahami produk dan batasannya.
- Gunakan [Current Frontend Feature Audit](prd/02-current-frontend-audit.md) saat menyelaraskan backend dengan kebutuhan UI React.
- Gunakan [Feature Requirements](prd/04-feature-requirements.md) sebagai acuan utama implementasi fitur.
- Gunakan [API Contract](api_contract.md) untuk detail endpoint, payload, response, dan status target.
