# TASKS

## Progress Legend
- `[x]` completed
- `[-]` in progress / next up
- `[ ]` planned

## Current Progress Snapshot
- `[x]` Foundation, data pipeline, backend API, app shell, study flow, quiz flow, persistence, browse/stats, base polish
- `[x]` Go-side repository/API tests
- `[x]` Frontend build verification
- `[x]` Quiz interaction tests for score and question progression
- `[-]` Next implementation focus: example sentence quality, then semantic layer continuation

## Phase 1 — Foundation
- `[x]` Root klasör düzenini kur: `backend`, `frontend`, `tools`, `data`, `docs`
- `[x]` `Go` modülünü ve `Vite React` uygulamasını başlat
- `[x]` Tek komutla import/build/run akışını `Makefile` içinde tanımla

## Phase 2 — Data Pipeline
- `[x]` Excel kaynağını `excelize` ile oku
- `[x]` `Word` ve `Definitons` kolonlarını doğrula
- `[x]` Boş satırları ve duplicate kayıtları temizle
- `[x]` Normalize `JSON` dataset ve `meta` çıktısı üret
- `[x]` Embed için backend tarafına kopyalanan veri artefaktlarını oluştur

## Phase 3 — Backend API
- `[x]` Gömülü dataset repository katmanını kur
- `[x]` `GET /healthz`, `GET /api/meta`, `GET /api/deck`, `GET /api/words`, `GET /api/words/:id` endpoint'lerini ekle
- `[x]` Arama, limit ve offset davranışını uygula
- `[x]` Build edilmiş frontend asset'lerini Go server üzerinden serve et

## Phase 4 — Frontend Shell
- `[x]` `React Router` ile uygulama iskeletini kur
- `[x]` Sol navigasyon, dashboard kabuğu ve responsive layout oluştur
- `[x]` Veri yükleme için provider/context akışını tanımla

## Phase 5 — Study Session
- `[x]` Review queue ve new word queue hesaplamasını ekle
- `[x]` Flashcard görünümü oluştur
- `[x]` `Again / Hard / Good / Easy` aksiyonlarını spaced repetition motoruna bağla
- `[x]` Session tamamlanınca kısa sonuç özeti üret

## Phase 6 — Quiz Mode
- `[x]` `definition -> word` çoktan seçmeli quiz üret
- `[x]` `word -> definition` modunu ayrı quiz yüzeyi olarak sun
- `[x]` Distractor seçim mantığını ekle
- `[x]` Doğru/yanlış sonucu progress state'e yaz
- `[x]` Quiz oturum geçmişini kaydet
- `[x]` Quiz akışında cevap sonrası soru ilerleme ve skor davranışını düzelt

## Phase 7 — Persistence
- `[x]` `studyProgress`, `appSettings`, `sessionHistory` sözleşmelerini tanımla
- `[x]` `localStorage` yükleme, kaydetme ve bozuk veri fallback mantığını uygula
- `[x]` Reset akışını ekle

## Phase 8 — Browse and Stats
- `[x]` Search ve sayfalama destekli browse ekranını ekle
- `[x]` Dashboard'da due count, coverage, latest session ve recent sessions kartlarını göster
- `[x]` Word bazında status ve next review bilgisini sun

## Phase 9 — Polish
- `[x]` Mobil kullanım için spacing ve CTA davranışlarını ayarla
- `[x]` Empty state ve error state ekranlarını tamamla
- `[x]` Tutarlı renk, tipografi ve panel sistemi uygula
- `[ ]` Klavye kısayolları ekle
- `[ ]` Focus mode tam ekran çalışma akışı ekle

## Phase 10 — Verification
- `[x]` Import hattı için temel doğrulama yap
- `[x]` Repository ve API için Go testleri ekle
- `[x]` Frontend production build'ini CI benzeri doğrulama olarak kullan
- `[x]` Quiz UI davranışı için frontend etkileşim testleri ekle
- `[x]` Study akışı için frontend etkileşim testleri ekle
- `[x]` localStorage import/export sanitize davranışı için test ekle
- `[ ]` localStorage migration ve reset davranışı için ek test ekle

## Phase 11 — High-Return Features
- `[ ]` Yazmalı quiz
  - `definition -> word` ve `word -> definition` çoktan seçmeli modları ayrı ayrı sunuldu
  - Kullanıcı cevabı yazar, toleranslı eşleşme ile kontrol edilir
  - Çoktan seçmeli quiz ile aynı progress motorunu kullanır
- `[x]` Hata defteri
  - Yanlış cevaplanan kelimeler için ayrı çalışma görünümü
  - Quiz ve study hataları ortak havuza yazılır
- `[-]` Örnek cümle desteği
  - Her kelime için en az bir kullanım örneği gösterilir
  - Mevcut build-time placeholder enrichment doğal cümle kalitesine ulaşmadığı için kaynak seçimi bekliyor
- `[x]` Günlük hedefler
  - Günlük `review` ve `new words` hedefleri tanımlanır
  - Dashboard hedef ilerlemesini gösterir
- `[x]` Progress export/import
  - `localStorage` state JSON olarak dışarı alınır
  - Aynı sözleşme ile geri yüklenir

## Phase 12 — Semantic Layer
- `[ ]` Related words panel
  - Benzer anlamlı veya yakın kelimeler kelime detayında gösterilir
- `[x]` Better distractors
  - Quiz seçenekleri rastgele yerine semantik olarak yakın adaylardan seçilir
- `[ ]` Semantic search
  - Tanım benzerliğine göre arama sonuçları zenginleştirilir
- `[ ]` Confused words
  - Sık karıştırılan kelime çiftleri ayrı yüzeyde gösterilir
- `[ ]` Topic clusters
  - Kelimeler tema bazlı çalışma kümelerine ayrılır

## Suggested Build Order From Here
- `1.` Örnek cümle kaynağını sağlamlaştır
- `2.` Related words
- `3.` Semantic search
- `4.` Confused words
- `5.` Progress export/import sonrası optional polish: keyboard shortcuts
- `6.` Typed quiz only if recall depth becomes the next priority
