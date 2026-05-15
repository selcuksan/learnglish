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
- Progress export/import
- Yazmalı quiz
- Daha sonra: related words, semantic search

## Kapsam Dışı
- Auth
- Çok kullanıcılı state
- Sunucu tarafı progress
- Seslendirme, örnek cümle, çoklu dil

Not: örnek cümle desteği roadmap'e alındı; mevcut sürümde henüz yok.
