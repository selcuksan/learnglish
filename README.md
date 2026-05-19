# Learnglish

## Proje Özeti
Learnglish, NGSL tabanlı İngilizce kelime çiftlerini kullanarak düzenli tekrar ve hafif ölçme akışı sunan yerel bir web uygulamasıdır. Ürün tek kullanıcı odaklıdır; kelime kataloğu `Go` backend tarafından servis edilir, öğrenme state'i ise tarayıcıdaki `localStorage` içinde tutulur.

## Mevcut Durum
- Dashboard, study, quiz, browse ve settings ekranları çalışıyor
- Excel import hattı normalize dataset üretiyor
- Quiz akışının soru ilerleme ve skor davranışı test ile doğrulandı
- Quiz içinde `definition -> word` ve `word -> definition` modları ayrı ayrı sunuluyor
- Yanlış cevaplanan kelimeler için ayrı `Mistakes` çalışma yüzeyi var
- Günlük review ve new word hedefleri dashboard ile settings arasında bağlı çalışıyor
- Progress artık `Settings` üzerinden JSON olarak export/import edilebiliyor
- Kelime kartları ve browse görünümü örnek cümle yüzeyini taşıyor; cümle kaynağı henüz kalite yükseltme aşamasında
- Quiz distractor seçenekleri artık definition benzerliğine göre daha yakın adaylardan seçiliyor
- Uygulama tek Go server üzerinden servis edilebiliyor

## Amaç
- İngilizce kelimeleri tanım odaklı tekrar etmek
- Kelime-tanım çiftlerini hızlı flashcard akışıyla çalışmak
- Basit spaced repetition ile doğru zamanda review almak
- Quiz akışıyla recall kalitesini ölçmek

## Stack
- Backend: `Go`, `chi`, `net/http`
- Veri importu: `excelize`
- Frontend: `React`, `TypeScript`, `Vite`
- UI: `Tailwind CSS`
- State: `localStorage`

## Çalıştırma
```bash
npm install --prefix frontend
make run
```

Uygulama varsayılan olarak `http://localhost:8080` üzerinde açılır.

## Geliştirme Komutları
```bash
make import
make build
make test
```

Frontend'i ayrı geliştirmek istersen:
```bash
cd frontend
npm run dev
```

Bu modda `Vite`, `/api` isteklerini `localhost:8080` adresine proxy eder.

## Ücretsiz Statik Deploy
Public GitHub repo için GitHub Pages kullanılabilir. Bu modda Go backend
çalışmaz; frontend kelime datasını statik JSON dosyalarından okur.

```bash
make frontend-build-static
```

GitHub Pages deploy'u için repo settings içinde `Pages` kaynağını
`GitHub Actions` olarak seç. `main` branch'e push gelince
`.github/workflows/pages.yml` frontend'i build edip yayınlar.
Repo alt path ve refresh için `404.html` fallback da build sırasında hazırlanır.

## Veri Kaynağı
- Kaynak dosya: `NGSL_1.2_with_English_definitions.xlsx`
- Sheet: `Sheet1`
- Beklenen kolonlar: `Word`, `Definitons`
- Normalize edilmiş çıktılar:
  - `data/words.json`
  - `data/meta.json`
  - `backend/internal/words/embed/*.json`

## Öğrenme Mantığı
- Flashcard ekranında kullanıcı `Again / Hard / Good / Easy` seçer
- Her seçim kelimeyi bir tekrar kovasına taşır
- Kova aralıkları: `0d, 1d, 3d, 7d, 14d, 30d`
- Quiz ekranı iki yönü destekler:
  - `definition -> correct word`
  - `word -> correct definition`
- Quiz sonucu da review state'ini etkiler

## Sonraki Yüksek Getirili Özellikler
- Örnek cümle desteği
- Related words
- Semantic search
- Confused words
- Yazmalı quiz

## Son Chat Sonunda Nerede Kaldık
- `Progress export/import` tamamlandı
- `Better distractors` tamamlandı
- Sıradaki en mantıklı feature wave:
  - doğal örnek cümle kaynağını sağlamlaştır
  - sonra `related words`
  - sonra `semantic search`
  - sonra `confused words`

## Kapsam Dışı
- Auth
- Çok kullanıcılı state
- Sunucu tarafı progress
- Seslendirme, örnek cümle, çoklu dil

Not: örnek cümle desteği roadmap'e alındı; mevcut sürümde henüz yok.
