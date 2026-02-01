# Destiny Loom API Documentation

Base URL: `http://localhost:3002/api`

All POST endpoints accept JSON bodies. All responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

## Error Format

All errors follow this structure:

```json
{
  "error": "Human-readable error message",
  "details": "Optional additional context"
}
```

---

## Health

### `GET /api/health`

Health check endpoint.

**Auth:** Public

**Response:**
```json
{
  "status": "ok",
  "app": "destiny-loom",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3002/api/health
```

---

## MBTI

### `GET /api/mbti/questions`

Get all 20 MBTI personality questions.

**Auth:** Public

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "text": "At a party, you tend to:",
      "dimension": "EI",
      "optionA": { "text": "Talk to many people", "value": "E" },
      "optionB": { "text": "Stay with people you know", "value": "I" }
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3002/api/mbti/questions
```

### `POST /api/mbti/analyze`

Compute MBTI type from answers and get AI personality analysis.

**Auth:** Public (AI analysis requires `OPENAI_API_KEY` env var)

**Body (max 20KB):**
```json
{
  "answers": [
    { "questionId": 1, "dimension": "EI", "value": "E" },
    { "questionId": 2, "dimension": "SN", "value": "N" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `answers` | array | Yes | Array of answer objects (max 50) |
| `answers[].questionId` | number | Yes | Question ID |
| `answers[].dimension` | string | Yes | One of: `EI`, `SN`, `TF`, `JP` |
| `answers[].value` | string | Yes | One of: `E`, `I`, `S`, `N`, `T`, `F`, `J`, `P` |

**Response (200):**
```json
{
  "type": "INFJ",
  "analysis": {
    "title": "The Digital Mystic",
    "summary": "...",
    "strengths": ["..."],
    "challenges": ["..."],
    "spiritAnimal": "...",
    "compatibility": ["ENFP", "ENTP"],
    "advice": "..."
  }
}
```

**Errors:** `400` Invalid answers, `413` Body too large, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/mbti/analyze \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":1,"dimension":"EI","value":"I"},{"questionId":2,"dimension":"SN","value":"N"}]}'
```

---

## Tarot

### `POST /api/tarot/draw`

Draw tarot cards for a spread.

**Auth:** Public

**Body (max 5KB):**
```json
{
  "spreadType": "three",
  "question": "Will I find love?"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `spreadType` | string | Yes | One of: `single` (1 card), `three` (3 cards), `celtic` (10 cards) |
| `question` | string | No | Optional question (max 500 chars) |

**Response (200):**
```json
{
  "spreadType": "three",
  "question": "Will I find love?",
  "cards": [
    {
      "name": "The Star",
      "position": "Past",
      "reversed": false,
      "keywords": ["hope", "inspiration", "renewal"],
      "arcana": "major"
    }
  ],
  "drawnAt": "2025-01-15T12:00:00.000Z"
}
```

**Errors:** `400` Invalid spread type or question, `413` Body too large, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/tarot/draw \
  -H "Content-Type: application/json" \
  -d '{"spreadType":"three","question":"What does my future hold?"}'
```

### `POST /api/tarot/analyze`

Get AI interpretation of a tarot spread.

**Auth:** Public (AI analysis requires `OPENAI_API_KEY`)

**Body (max 20KB):**
```json
{
  "cards": [
    { "name": "The Star", "position": "Past", "reversed": false },
    { "name": "The Moon", "position": "Present", "reversed": true },
    { "name": "The Sun", "position": "Future", "reversed": false }
  ],
  "spreadType": "three",
  "question": "What does my future hold?",
  "locale": "en"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cards` | array | Yes | Drawn cards with name, position, reversed |
| `spreadType` | string | Yes | One of: `single`, `three`, `celtic` |
| `question` | string | No | Optional question (max 500 chars, sanitized) |
| `locale` | string | No | One of: `en`, `zh`, `zh-CN`, `zh-TW` |

**Errors:** `400` Invalid cards/spread/locale, duplicate cards, unknown card name, card count mismatch, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/tarot/analyze \
  -H "Content-Type: application/json" \
  -d '{"cards":[{"name":"The Fool","position":"Present Energy","reversed":false}],"spreadType":"single"}'
```

---

## Zodiac

### `POST /api/zodiac/reading`

Get AI zodiac horoscope reading.

**Auth:** Public (AI analysis requires `OPENAI_API_KEY`)

**Body (max 5KB):**
```json
{
  "sign": "scorpio",
  "period": "daily",
  "locale": "en"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sign` | string | Yes | Zodiac sign (lowercase): `aries`, `taurus`, `gemini`, `cancer`, `leo`, `virgo`, `libra`, `scorpio`, `sagittarius`, `capricorn`, `aquarius`, `pisces` |
| `period` | string | Yes | One of: `daily`, `weekly`, `monthly` |
| `locale` | string | No | One of: `en`, `zh`, `zh-CN`, `zh-TW` |

**Response (200):**
```json
{
  "reading": { "horoscope": "...", "luckyNumber": 7 },
  "sign": "scorpio",
  "period": "daily"
}
```

**Errors:** `400` Invalid sign or period, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/zodiac/reading \
  -H "Content-Type: application/json" \
  -d '{"sign":"scorpio","period":"daily"}'
```

### `POST /api/zodiac/compatibility`

Get AI zodiac compatibility analysis between two signs.

**Auth:** Public (AI analysis requires `OPENAI_API_KEY`)

**Body (max 5KB):**
```json
{
  "sign1": "aries",
  "sign2": "libra",
  "locale": "en"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sign1` | string | Yes | First zodiac sign (lowercase) |
| `sign2` | string | Yes | Second zodiac sign (lowercase) |
| `locale` | string | No | One of: `en`, `zh`, `zh-CN`, `zh-TW` |

**Response (200):**
```json
{
  "compatibility": { "score": 85, "analysis": "..." },
  "sign1": "aries",
  "sign2": "libra"
}
```

**Errors:** `400` Invalid sign(s), `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/zodiac/compatibility \
  -H "Content-Type: application/json" \
  -d '{"sign1":"aries","sign2":"libra"}'
```

---

## I Ching

### `POST /api/i-ching/cast`

Cast an I Ching hexagram using the three-coin method.

**Auth:** Public

**Body (max 5KB):**
```json
{
  "question": "Should I change careers?"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | No | Optional question (max 500 chars) |

**Response (200):**
```json
{
  "hexagram": {
    "number": 1,
    "name": "The Creative",
    "chinese": "乾",
    "trigrams": { "upper": "Heaven", "lower": "Heaven" },
    "description": "Pure creative force, heaven over heaven"
  },
  "lines": [
    { "position": 1, "value": 7, "type": "yang", "changing": false }
  ],
  "changingLines": [3, 5],
  "resultHexagram": { "number": 44, "name": "Coming to Meet", "..." : "..." },
  "question": "Should I change careers?",
  "castAt": "2025-01-15T12:00:00.000Z"
}
```

**Errors:** `400` Invalid question, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/i-ching/cast \
  -H "Content-Type: application/json" \
  -d '{"question":"Should I change careers?"}'
```

### `POST /api/i-ching/analyze`

Get AI interpretation of an I Ching hexagram.

**Auth:** Public (AI analysis requires `OPENAI_API_KEY`)

**Body (max 10KB):**
```json
{
  "hexagram": { "number": 1, "name": "The Creative", "chinese": "乾", "trigrams": { "upper": "Heaven", "lower": "Heaven" }, "description": "..." },
  "changingLines": [3, 5],
  "question": "Should I change careers?",
  "locale": "zh"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hexagram` | object | Yes | Hexagram data with number (1-64) and name |
| `changingLines` | number[] | Yes | Array of changing line positions (1-6) |
| `question` | string | No | Optional question (max 500 chars, sanitized) |
| `locale` | string | No | One of: `en`, `zh`, `zh-CN`, `zh-TW` |

**Errors:** `400` Invalid hexagram/changingLines/locale, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/i-ching/analyze \
  -H "Content-Type: application/json" \
  -d '{"hexagram":{"number":1,"name":"The Creative","chinese":"乾","trigrams":{"upper":"Heaven","lower":"Heaven"},"description":"test"},"changingLines":[]}'
```

---

## Four Pillars (BaZi)

### `POST /api/four-pillars/calculate`

Calculate Four Pillars of Destiny from a birth date.

**Auth:** Public

**Body (max 5KB):**
```json
{
  "year": 1990,
  "month": 6,
  "day": 15,
  "hour": 10,
  "gender": "female"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `year` | integer | Yes | Birth year (1-2200) |
| `month` | integer | Yes | Birth month (1-12) |
| `day` | integer | Yes | Birth day (1-31) |
| `hour` | integer | Yes | Birth hour (0-23) |
| `gender` | string | No | One of: `male`, `female`, `other` (default: `other`) |

**Response (200):**
```json
{
  "pillars": {
    "year": { "stem": { "chinese": "庚", "pinyin": "Gēng", "element": "Metal" }, "branch": { "chinese": "午", "animal": "Horse" } },
    "month": { "..." : "..." },
    "day": { "..." : "..." },
    "hour": { "..." : "..." },
    "dominantElements": { "Wood": 1, "Fire": 3, "Earth": 2, "Metal": 1, "Water": 1 }
  },
  "input": { "year": 1990, "month": 6, "day": 15, "hour": 10, "gender": "female" },
  "calculatedAt": "2025-01-15T12:00:00.000Z"
}
```

**Errors:** `400` Missing/invalid fields, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/four-pillars/calculate \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":6,"day":15,"hour":10,"gender":"female"}'
```

### `POST /api/four-pillars/analyze`

Get AI BaZi interpretation of calculated pillars.

**Auth:** Public (AI analysis requires `OPENAI_API_KEY`)

**Body (max 10KB):**
```json
{
  "pillars": { "year": {}, "month": {}, "day": {}, "hour": {}, "dominantElements": {} },
  "gender": "female",
  "locale": "zh"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pillars` | object | Yes | Four Pillars result from `/calculate` |
| `gender` | string | No | One of: `male`, `female`, `other` |
| `locale` | string | No | One of: `en`, `zh`, `zh-CN`, `zh-TW` |

**Errors:** `400` Invalid pillars/gender/locale, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/four-pillars/analyze \
  -H "Content-Type: application/json" \
  -d '{"pillars":{"year":{"stem":{"index":0},"branch":{"index":0}},"month":{"stem":{"index":0},"branch":{"index":0}},"day":{"stem":{"index":0},"branch":{"index":0}},"hour":{"stem":{"index":0},"branch":{"index":0}},"dominantElements":{}},"gender":"other"}'
```

---

## History

### `GET /api/history?userId=demo-user`

Get reading history for a user. *(Currently returns mock data)*

**Auth:** Public (will require auth in future)

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `userId` | string | `demo-user` | User identifier |

**Response (200):**
```json
{
  "history": [
    { "id": "mock-1", "type": "mbti", "result": {}, "createdAt": "...", "userId": "demo-user" }
  ],
  "userId": "demo-user"
}
```

**Example:**
```bash
curl http://localhost:3002/api/history?userId=demo-user
```

### `POST /api/history`

Save a reading to history. *(Currently mock — DB integration pending)*

**Auth:** Public (will require auth in future)

**Body (max 50KB):**
```json
{
  "type": "mbti",
  "result": { "type": "INFJ" },
  "userId": "demo-user"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | One of: `mbti`, `tarot`, `zodiac` |
| `result` | object | Yes | Reading result data |
| `userId` | string | No | User identifier (default: `anonymous`) |

**Response (201):**
```json
{
  "saved": { "id": "mock-...", "type": "mbti", "result": {}, "createdAt": "...", "userId": "demo-user" },
  "message": "Mock save — DB integration pending"
}
```

**Errors:** `400` Invalid type or missing result, `413` Body too large, `500` Server error

**Example:**
```bash
curl -X POST http://localhost:3002/api/history \
  -H "Content-Type: application/json" \
  -d '{"type":"mbti","result":{"type":"INFJ"},"userId":"demo-user"}'
```
