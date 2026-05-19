# Learnglish MVP Plan

## Summary
- Tek kullanıcıya yönelik, yerelde çalışan bir İngilizce kelime öğrenme web app'i
- Veri kaynağı mevcut Excel dosyası
- `Go` backend + `React/TypeScript` frontend
- Kullanıcı state'i `localStorage` içinde tutulur
- Ana akış: dashboard, study, quiz, browse, settings

## Core Decisions
- Backend veri servisi ve static asset serving için kullanılır
- Auth yok; server-side progress yok
- Excel verisi build-time normalize edilir
- Spaced repetition modeli `Leitner-benzeri bucket` yapısıdır
- Quiz ilk sürümde sadece `definition -> correct word` akışını destekler

## Accepted Interface Contracts
- `GET /api/meta`
- `GET /api/deck`
- `GET /api/words?search=&limit=&offset=`
- `GET /api/words/:id`
- Local persistence keys:
  - `studyProgress`
  - `appSettings`
  - `sessionHistory`

## Acceptance Criteria
- Excel'den gelen dataset normalize edilip API üzerinden okunabiliyor
- Frontend dashboard, study, quiz, browse ve settings ekranları çalışıyor
- Kullanıcı review verdikçe progress tarayıcıda kalıcı oluyor
- Frontend build edildikten sonra Go server tek başına uygulamayı sunabiliyor
- Temel repository ve API testleri geçiyor
- Quiz akışında doğru ve yanlış cevap sonrası soru ilerleme davranışı test ile korunuyor

## Current Status
- MVP omurgası tamamlandı ve çalışır durumda
- İlk kritik UI bugfix yapıldı: quiz reset problemi giderildi
- Quiz iki ayrı yönle çalışıyor: `definition -> word` ve `word -> definition`
- Hata defteri eklendi ve yanlış cevap havuzu ayrı bir review akışına bağlandı
- Günlük hedefler eklendi; session history üzerinden günlük review/new progress hesaplanıyor
- Better distractors eklendi; quiz yanlış şıkları artık definition similarity ağırlıklı seçiliyor
- Progress export/import eklendi; tarayıcı state'i JSON backup olarak dışa alınıp geri yüklenebiliyor
- Example sentence yüzeyi eklendi; mevcut build-time placeholder cümleler doğal kullanım kalitesine ulaşmadığı için kaynak seçimi açık kaldı
- Sonraki geliştirme dalgası öğrenme kalitesini yükseltecek özelliklere ayrıldı

## Next Feature Wave
- Örnek cümle kaynağını sağlamlaştır
- Semantic layer devamı:
  - related words
  - semantic search
  - confused words
- Typed quiz yalnızca daha derin recall ihtiyacı öncelik kazanırsa

## Defaults and Assumptions
- Hedef kullanım kişisel ve lokaldir
- Çok kullanıcılı genişleme sonraki faza bırakılmıştır
- Veri kaynağı tek Excel dosyasıdır
- İleri SRS algoritmaları sonraya bırakılmıştır
