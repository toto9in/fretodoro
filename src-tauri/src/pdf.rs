use chrono::Datelike;
use std::fs;
use tauri::AppHandle;

use typst::diag::{FileError, FileResult};
use typst::foundations::{Bytes, Datetime};
use typst::syntax::{FileId, Source};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Library, LibraryExt, World};

use crate::schedule::{get_schedule_inner, DayOfWeek, Schedule};

struct ScheduleWorld {
    library: LazyHash<Library>,
    book: LazyHash<FontBook>,
    source: Source,
    fonts: Vec<Font>,
}

impl ScheduleWorld {
    fn new(typst_source: String) -> Self {
        let fonts: Vec<Font> = typst_assets::fonts()
            .flat_map(|data| Font::iter(Bytes::new(data)))
            .collect();

        Self {
            library: LazyHash::new(Library::default()),
            book: LazyHash::new(FontBook::from_fonts(&fonts)),
            source: Source::detached(typst_source),
            fonts,
        }
    }
}

impl World for ScheduleWorld {
    fn library(&self) -> &LazyHash<Library> {
        &self.library
    }
    fn book(&self) -> &LazyHash<FontBook> {
        &self.book
    }
    fn main(&self) -> FileId {
        self.source.id()
    }

    fn source(&self, id: FileId) -> FileResult<Source> {
        if id == self.source.id() {
            Ok(self.source.clone())
        } else {
            Err(FileError::NotFound(
                id.vpath().as_rootless_path().to_path_buf(),
            ))
        }
    }

    fn file(&self, id: FileId) -> FileResult<Bytes> {
        Err(FileError::NotFound(
            id.vpath().as_rootless_path().to_path_buf(),
        ))
    }

    fn font(&self, index: usize) -> Option<Font> {
        self.fonts.get(index).cloned()
    }

    fn today(&self, _offset: Option<i64>) -> Option<Datetime> {
        let now = chrono::Local::now();
        Datetime::from_ymd(now.year(), now.month() as u8, now.day() as u8)
    }
}

struct Labels {
    title: &'static str,
    generated_on: &'static str,
    landscape_view: &'static str,
    monday: &'static str,
    tuesday: &'static str,
    wednesday: &'static str,
    thursday: &'static str,
    friday: &'static str,
    saturday: &'static str,
    sunday: &'static str,
}

impl Labels {
    fn for_lang(lang: &str) -> Self {
        match lang {
            "en" => Self {
                title: "Fretodoro — Weekly Schedule",
                generated_on: "Generated on",
                landscape_view: "Landscape view",
                monday: "Monday",
                tuesday: "Tuesday",
                wednesday: "Wednesday",
                thursday: "Thursday",
                friday: "Friday",
                saturday: "Saturday",
                sunday: "Sunday",
            },
            _ => Self {
                title: "Fretodoro — Cronograma Semanal",
                generated_on: "Gerado em",
                landscape_view: "Vista paisagem",
                monday: "Segunda",
                tuesday: "Terça",
                wednesday: "Quarta",
                thursday: "Quinta",
                friday: "Sexta",
                saturday: "Sábado",
                sunday: "Domingo",
            },
        }
    }
}

fn escape_typst_characters(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        if matches!(
            c,
            '#' | '[' | ']' | '*' | '_' | '~' | '@' | '\\' | '<' | '>'
        ) {
            out.push('\\');
        }
        out.push(c);
    }
    out
}

fn cell(schedule: &Schedule, day: DayOfWeek) -> String {
    let Some(routine) = schedule
        .routines
        .iter()
        .find(|r| r.day_of_week == day)
        .filter(|r| !r.blocks.is_empty())
    else {
        return "[#text(fill: luma(180))[—]]".to_string();
    };

    let lines: Vec<String> = routine
        .blocks
        .iter()
        .map(|b| {
            format!(
                "*{}* \\ _{} min_",
                escape_typst_characters(&b.title),
                b.duration_minutes
            )
        })
        .collect();

    format!("[\n    {}\n  ]", lines.join(" \\ #v(2pt)\n    "))
}

fn generate_typst_source(schedule: &Schedule, lang: &str) -> String {
    let l = Labels::for_lang(lang);

    let now = chrono::Local::now();
    let date = format!("{:02}/{:02}/{}", now.day(), now.month(), now.year());

    let segunda = cell(schedule, DayOfWeek::Monday);
    let terca = cell(schedule, DayOfWeek::Tuesday);
    let quarta = cell(schedule, DayOfWeek::Wednesday);
    let quinta = cell(schedule, DayOfWeek::Thursday);
    let sexta = cell(schedule, DayOfWeek::Friday);
    let sabado = cell(schedule, DayOfWeek::Saturday);
    let domingo = cell(schedule, DayOfWeek::Sunday);

    format!(
        r##"
// ── Página 1: retrato A4 ──────────────────────────────────────────

#set page(paper: "a4", margin: (x: 1.5cm, y: 2cm))
#set text(size: 9pt)

= {title}
#text(size: 7.5pt, fill: luma(140))[{generated_on} {date}]

#v(0.4cm)

#table(
  columns: (1fr,) * 7,
  stroke: 0.5pt + luma(200),
  inset: 7pt,

  table.cell(fill: luma(220))[*{monday}*],
  table.cell(fill: luma(220))[*{tuesday}*],
  table.cell(fill: luma(220))[*{wednesday}*],
  table.cell(fill: luma(220))[*{thursday}*],
  table.cell(fill: luma(220))[*{friday}*],
  table.cell(fill: luma(220))[*{saturday}*],
  table.cell(fill: luma(220))[*{sunday}*],

  {segunda},
  {terca},
  {quarta},
  {quinta},
  {sexta},
  {sabado},
  {domingo},
)

#pagebreak()

// ── Página 2: paisagem A4 (tablet) ───────────────────────────────

#set page(paper: "a4", flipped: true, margin: (x: 1.5cm, y: 1.5cm))
#set text(size: 10pt)

= {title}
#text(size: 7.5pt, fill: luma(140))[{date} — {landscape_view}]

#v(0.4cm)

#table(
  columns: (1fr,) * 7,
  stroke: 0.5pt + luma(200),
  inset: 7pt,

  table.cell(fill: luma(220))[*{monday}*],
  table.cell(fill: luma(220))[*{tuesday}*],
  table.cell(fill: luma(220))[*{wednesday}*],
  table.cell(fill: luma(220))[*{thursday}*],
  table.cell(fill: luma(220))[*{friday}*],
  table.cell(fill: luma(220))[*{saturday}*],
  table.cell(fill: luma(220))[*{sunday}*],

  {segunda},
  {terca},
  {quarta},
  {quinta},
  {sexta},
  {sabado},
  {domingo},
)
"##,
        title = l.title,
        generated_on = l.generated_on,
        landscape_view = l.landscape_view,
        date = date,
        monday = l.monday,
        tuesday = l.tuesday,
        wednesday = l.wednesday,
        thursday = l.thursday,
        friday = l.friday,
        saturday = l.saturday,
        sunday = l.sunday,
        segunda = segunda,
        terca = terca,
        quarta = quarta,
        quinta = quinta,
        sexta = sexta,
        sabado = sabado,
        domingo = domingo,
    )
}

// ─────────────────────────────────────────────
// Tauri command
// ─────────────────────────────────────────────

#[tauri::command]
pub fn export_schedule_pdf(app: AppHandle, path: String, lang: String) -> Result<(), String> {
    let schedule = get_schedule_inner(&app)?;

    let document = typst::compile(&ScheduleWorld::new(generate_typst_source(&schedule, &lang)))
        .output
        .map_err(|errs| {
            errs.iter()
                .map(|d: &typst::diag::SourceDiagnostic| d.message.to_string())
                .collect::<Vec<_>>()
                .join("; ")
        })?;

    let pdf_bytes = typst_pdf::pdf(&document, &typst_pdf::PdfOptions::default())
        .map_err(|e| format!("{e:?}"))?;

    fs::write(&path, pdf_bytes).map_err(|e| e.to_string())
}
