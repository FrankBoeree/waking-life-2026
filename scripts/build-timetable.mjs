import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DAYS = ["wednesday", "thursday", "friday", "saturday", "sunday", "monday"]

function slugify(name, stage, startDay, startTime) {
  return `${name}-${stage}-${startDay}-${startTime}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function nextDay(day) {
  const idx = DAYS.indexOf(day)
  return idx >= 0 && idx < DAYS.length - 1 ? DAYS[idx + 1] : day
}

function entry(name, stage, startDay, startTime, endTime, endDay = startDay, options = {}) {
  if (options.openEnded) {
    return {
      id: slugify(name, stage, startDay, startTime),
      name,
      startTime,
      endTime: "..:..",
      stage,
      startDay,
      endDay: startDay,
      durationMinutes: options.durationMinutes ?? 360,
    }
  }

  const startMinutes = toMinutes(startTime)
  const endMinutes = toMinutes(endTime)
  const resolvedEndDay =
    endDay !== startDay ? endDay : endMinutes <= startMinutes ? nextDay(startDay) : startDay

  return {
    id: slugify(name, stage, startDay, startTime),
    name,
    startTime,
    endTime,
    stage,
    startDay,
    endDay: resolvedEndDay,
  }
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const slots = [
  // Praia
  entry("Tristan Arp", "Praia", "wednesday", "21:00", "22:00"),
  entry("Party Smith", "Praia", "wednesday", "22:00", "01:00"),
  entry("Dj Marcelle", "Praia", "thursday", "01:00", "04:00"),
  entry("Kiss Nuka", "Praia", "thursday", "04:00", "06:00"),
  entry("a pausa", "Praia", "thursday", "06:00", "12:00"),
  entry("Om Unit Acid Dub Studies", "Praia", "thursday", "12:00", "13:00"),
  entry("e l e m e n t a l", "Praia", "thursday", "13:00", "16:00"),
  entry("protodub", "Praia", "thursday", "16:00", "19:00"),
  entry("Marylou", "Praia", "thursday", "19:00", "23:00"),
  entry("Mia Koden", "Praia", "thursday", "23:00", "02:00"),
  entry("Mala", "Praia", "friday", "02:00", "04:00"),
  entry("Mix'Elle", "Praia", "friday", "04:00", "06:00"),
  entry("a pausa", "Praia", "friday", "06:00", "12:00"),
  entry("o ghettão", "Praia", "friday", "12:00", "14:00"),
  entry("Dj Caring", "Praia", "friday", "14:00", "17:00"),
  entry("Nightmares on Wax", "Praia", "friday", "17:00", "20:00"),
  entry("Ojoo", "Praia", "friday", "20:00", "23:00"),
  entry("Dj Godfather", "Praia", "friday", "23:00", "00:00"),
  entry("NikNak", "Praia", "saturday", "00:00", "01:00"),
  entry("Nosedrip", "Praia", "saturday", "01:00", "06:00"),
  entry("a pausa", "Praia", "saturday", "06:00", "12:00"),
  entry("Hugo Sanchez", "Praia", "saturday", "12:00", "16:00"),
  entry("Alan Braxe", "Praia", "saturday", "16:00", "18:00"),
  entry("Arrogance Arrogance", "Praia", "saturday", "18:00", "21:00"),
  entry("Natalia Escobar", "Praia", "saturday", "21:00", "00:00"),
  entry("Shackleton", "Praia", "sunday", "00:00", "01:00"),
  entry("Olgica", "Praia", "sunday", "01:00", "03:00"),
  entry("Upsammy x Gyrofield", "Praia", "sunday", "03:00", "06:00"),
  entry("a pausa", "Praia", "sunday", "06:00", "14:00"),
  entry("Selecta Fontes", "Praia", "sunday", "14:00", "16:00"),
  entry("Vixen Sound", "Praia", "sunday", "16:00", "18:00"),
  entry("Simply Rockers Sound System", "Praia", "sunday", "18:00", "20:00"),
  entry("Vedic Roots", "Praia", "sunday", "20:00", "22:00"),
  entry("Lion's Den", "Praia", "sunday", "22:00", "00:00"),
  entry("Simply Rockers Sound System", "Praia", "monday", "00:00", "02:00"),

  // Outro Lado
  entry("Edward", "Outro Lado", "thursday", "12:00", "16:00"),
  entry("Alton Miller", "Outro Lado", "thursday", "16:00", "19:00"),
  entry("Yamour", "Outro Lado", "thursday", "19:00", "22:00"),
  entry("XDB & Lowtec", "Outro Lado", "thursday", "22:00", "01:00"),
  entry("Michael J Blood", "Outro Lado", "friday", "01:00", "04:00"),
  entry("Flo Masse", "Outro Lado", "friday", "04:00", "07:00"),
  entry("Elli", "Outro Lado", "friday", "07:00", "10:00"),
  entry("Drama", "Outro Lado", "friday", "10:00", "11:30"),
  entry("Coco Maria", "Outro Lado", "friday", "11:30", "14:00"),
  entry("Millie McKee", "Outro Lado", "friday", "14:00", "16:00"),
  entry("Pedro Tenreiro", "Outro Lado", "friday", "16:00", "18:00"),
  entry("I:Cube", "Outro Lado", "friday", "18:00", "19:00"),
  entry("Matthias Reiling", "Outro Lado", "friday", "19:00", "22:00"),
  entry("Keith Worthy", "Outro Lado", "friday", "22:00", "01:00"),
  entry("Cosmo", "Outro Lado", "saturday", "01:00", "04:00"),
  entry("Cassy", "Outro Lado", "saturday", "04:00", "07:00"),
  entry("Leafar Legov", "Outro Lado", "saturday", "07:00", "10:00"),
  entry("Margaux Gazur", "Outro Lado", "saturday", "10:00", "11:00"),
  entry("Alexandre Centeio", "Outro Lado", "saturday", "11:00", "12:00"),
  entry("Birds & Tapes", "Outro Lado", "saturday", "12:00", "13:00"),
  entry("Ani Zakareishvili", "Outro Lado", "saturday", "13:00", "14:00"),
  entry("Lerosa", "Outro Lado", "saturday", "14:00", "15:00"),
  entry("Billi", "Outro Lado", "saturday", "15:00", "18:00"),
  entry("Aleksi Perälä", "Outro Lado", "saturday", "18:00", "20:00"),
  entry("Parallel 9", "Outro Lado", "saturday", "20:00", "22:00"),
  entry("Edward & Konstantin", "Outro Lado", "saturday", "22:00", "02:00"),
  entry("Tobias.", "Outro Lado", "sunday", "02:00", "04:00"),
  entry("Serenne", "Outro Lado", "sunday", "04:00", "06:00"),
  entry("SnPLO", "Outro Lado", "sunday", "06:00", "10:00"),
  entry("Jan Jelinek", "Outro Lado", "sunday", "10:00", "11:00"),
  entry("Sam Prekop", "Outro Lado", "sunday", "11:00", "12:00"),
  entry("Lina", "Outro Lado", "sunday", "12:00", "14:00"),
  entry("Tau Car", "Outro Lado", "sunday", "14:00", "16:00"),
  entry("Andrés Zacco", "Outro Lado", "sunday", "16:00", "18:00"),
  entry("Jichael Mackson", "Outro Lado", "sunday", "18:00", "20:00"),
  entry("Lawrence & Thomas Melchior", "Outro Lado", "sunday", "20:00", "21:00"),
  entry("Ulf Eriksson", "Outro Lado", "sunday", "21:00", "00:00"),
  entry("Eduardo de la Calle", "Outro Lado", "monday", "00:00", "01:00"),
  entry("Jane Fitz", "Outro Lado", "monday", "01:00", "05:00"),
  entry("Vera, DJ Dustin, Mimi, Vuur, ...", "Outro Lado", "monday", "05:00", "..:..", "monday", {
    openEnded: true,
    durationMinutes: 360,
  }),

  // Floresta
  entry("Carmen Villain", "Floresta", "wednesday", "21:00", "21:45"),
  entry("Yentl.", "Floresta", "wednesday", "21:45", "01:00"),
  entry("Magda & Mike Servito", "Floresta", "thursday", "01:00", "04:00"),
  entry("Tina", "Floresta", "thursday", "04:00", "07:00"),
  entry("mad miran", "Floresta", "thursday", "07:00", "10:00"),
  entry("a pausa", "Floresta", "thursday", "10:00", "14:00"),
  entry("DJ Trystero", "Floresta", "thursday", "14:00", "17:00"),
  entry("Vlada", "Floresta", "thursday", "17:00", "20:00"),
  entry("CCL", "Floresta", "thursday", "20:00", "23:00"),
  entry("VIL", "Floresta", "thursday", "23:00", "02:00"),
  entry("69db presents Wave Arising", "Floresta", "friday", "02:00", "04:00"),
  entry("Haruka", "Floresta", "friday", "04:00", "07:00"),
  entry("Konduku", "Floresta", "friday", "07:00", "10:00"),
  entry("a pausa", "Floresta", "friday", "10:00", "14:00"),
  entry("Nathalie Seres", "Floresta", "friday", "14:00", "17:00"),
  entry("Rhadoo", "Floresta", "friday", "17:00", "23:00"),
  entry("Tiago", "Floresta", "friday", "23:00", "03:00"),
  entry("Koodoo & Lamaz", "Floresta", "saturday", "03:00", "07:00"),
  entry("Paquita Gordon", "Floresta", "saturday", "07:00", "10:00"),
  entry("a pausa", "Floresta", "saturday", "10:00", "14:00"),
  entry("Dana Kuehr", "Floresta", "saturday", "14:00", "17:00"),
  entry("Serginho", "Floresta", "saturday", "17:00", "20:00"),
  entry("Prosumer", "Floresta", "saturday", "20:00", "00:00"),
  entry("BASHKKA", "Floresta", "sunday", "00:00", "04:00"),
  entry("Amelia Holt", "Floresta", "sunday", "04:00", "07:00"),
  entry("DVDE", "Floresta", "sunday", "07:00", "10:00"),
  entry("a pausa", "Floresta", "sunday", "10:00", "14:00"),
  entry("Katatonic Silentio", "Floresta", "sunday", "14:00", "15:00"),
  entry("Valody", "Floresta", "sunday", "15:00", "17:30"),
  entry("2JACK4U", "Floresta", "sunday", "17:30", "20:00"),
  entry("Carrier & Gavsborg", "Floresta", "sunday", "20:00", "21:30"),
  entry("Dasha Rush", "Floresta", "sunday", "21:30", "01:00"),
  entry("Polar Inertia", "Floresta", "monday", "01:00", "02:30"),
  entry("Rene Wise", "Floresta", "monday", "02:30", "06:00"),
  entry("rRoxymore", "Floresta", "monday", "06:00", "09:00"),
  entry("Kia & Richard Akingbehin", "Floresta", "monday", "09:00", "13:00"),
  entry("Kuba'97", "Floresta", "monday", "13:00", "16:00"),
  entry("Djrum", "Floresta", "monday", "16:00", "..:..", "monday", {
    openEnded: true,
    durationMinutes: 360,
  }),

  // Cochilo
  entry("Otto Landsberg & Shin Hyo Jin", "Cochilo", "wednesday", "21:00", "21:45"),
  entry("Mohammad Reza Mortazavi", "Cochilo", "wednesday", "22:00", "23:00"),
  entry("Nídia & Valentina Magaletti", "Cochilo", "wednesday", "23:30", "00:15"),
  entry("Nkisi", "Cochilo", "thursday", "00:45", "01:30"),
  entry("HHY & The Kampala Unit", "Cochilo", "thursday", "02:00", "02:45"),
  entry("Força Maior", "Cochilo", "thursday", "12:00", "13:00"),
  entry(
    "Charlemagne Palestine, Oren Ambarchi & Daniel O'Sullivan present KKAARREENNIINNAA",
    "Cochilo",
    "thursday",
    "16:10",
    "17:00",
  ),
  entry("Holy Tongue", "Cochilo", "thursday", "19:00", "20:00"),
  entry("Niño de Elche", "Cochilo", "thursday", "22:30", "23:30"),
  entry("Takkak Takkak", "Cochilo", "friday", "01:00", "02:00"),
  entry("Djrum", "Cochilo", "friday", "12:00", "14:00"),
  entry("Samuel Rohrer & Eivind Aarset", "Cochilo", "friday", "15:00", "16:00"),
  entry("Heith & Tarawangawelas present Duori", "Cochilo", "friday", "18:00", "18:45"),
  entry("Michelle Gurevich", "Cochilo", "friday", "21:00", "22:15"),
  entry("Lip Sync 4 your Waking Life", "Cochilo", "friday", "23:30", "02:00"),
  entry("Lula Pena", "Cochilo", "saturday", "12:00", "13:00"),
  entry("Bonga", "Cochilo", "saturday", "16:00", "17:00"),
  entry("John McEntire & Sam Prekop", "Cochilo", "saturday", "18:00", "19:00"),
  entry("O Ghettão", "Cochilo", "saturday", "20:30", "22:00"),
  entry("Joshua Serafin & Mario Barrantes Espinoza w/ Fake Moss", "Cochilo", "sunday", "01:00", "02:00"),
  entry("Kitty Daisy & Lewis", "Cochilo", "sunday", "12:00", "13:00"),
  entry("Asmaa Hamzaoui & Bnat Timbouktou", "Cochilo", "sunday", "15:00", "16:15"),
  entry("Pedrinho Xalé", "Cochilo", "sunday", "17:30", "18:30"),
  entry("Ata Kak", "Cochilo", "sunday", "20:30", "21:30"),
  entry("Decius", "Cochilo", "monday", "00:00", "01:15"),
  entry("e/tape", "Cochilo", "monday", "07:00", "10:00"),
  entry("Alexi Perälä", "Cochilo", "monday", "10:00", "12:00"),
  entry("Devon Rexi", "Cochilo", "monday", "15:00", "16:00"),
  entry("Sonic Interventions", "Cochilo", "monday", "17:30", "18:30"),
  entry("Shahzad Ismaily", "Cochilo", "monday", "13:00", "14:00"),
  entry("Robert Aiki Aubrey Lowe", "Cochilo", "monday", "21:00", "21:50"),
  entry("Colleen presents Libres Antes del Final", "Cochilo", "monday", "22:00", "22:55"),
]

const ids = new Set()
for (const slot of slots) {
  if (ids.has(slot.id)) {
    throw new Error(`Duplicate id: ${slot.id}`)
  }
  ids.add(slot.id)
}

const payload = {
  version: "2026.2.3",
  timetable: slots,
}

const outputPath = join(__dirname, "../public/festival-data.json")
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${slots.length} timetable entries to ${outputPath}`)
