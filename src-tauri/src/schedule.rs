use chrono::Datelike;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use uuid::Uuid;

// ─────────────────────────────────────────────
// Data model
// ─────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    pub id: Uuid,
    pub title: String,
    pub duration_minutes: u32,
    pub order_index: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DayRoutine {
    pub day_of_week: DayOfWeek,
    pub blocks: Vec<Block>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Schedule {
    pub routines: Vec<DayRoutine>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DayOfWeek {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}

impl Default for Schedule {
    fn default() -> Self {
        Schedule { routines: vec![] }
    }
}

// ─────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────

fn get_schedule_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    println!("{:?}", path);
    path.push("schedule.json");
    Ok(path)
}

pub(crate) fn get_schedule_inner(app: &AppHandle) -> Result<Schedule, String> {
    let path = get_schedule_path(app)?;
    if !path.exists() {
        return Ok(Schedule::default());
    }
    let contents = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let schedule: Schedule = serde_json::from_str(&contents).map_err(|e| e.to_string())?;
    Ok(schedule)
}

// ─────────────────────────────────────────────
// Tauri commands
// ─────────────────────────────────────────────

#[tauri::command]
pub fn get_schedule(app: AppHandle) -> Result<Schedule, String> {
    get_schedule_inner(&app)
}

#[tauri::command]
pub fn save_schedule(app: AppHandle, schedule: Schedule) -> Result<(), String> {
    let path = get_schedule_path(&app)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let contents = serde_json::to_string_pretty(&schedule).map_err(|e| e.to_string())?;
    fs::write(path, contents).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_today_routine(app: AppHandle) -> Result<Option<DayRoutine>, String> {
    let schedule = get_schedule_inner(&app)?;
    let today = chrono::Local::now().weekday();

    let target_day = match today {
        chrono::Weekday::Mon => DayOfWeek::Monday,
        chrono::Weekday::Tue => DayOfWeek::Tuesday,
        chrono::Weekday::Wed => DayOfWeek::Wednesday,
        chrono::Weekday::Thu => DayOfWeek::Thursday,
        chrono::Weekday::Fri => DayOfWeek::Friday,
        chrono::Weekday::Sat => DayOfWeek::Saturday,
        chrono::Weekday::Sun => DayOfWeek::Sunday,
    };

    Ok(schedule
        .routines
        .into_iter()
        .find(|r| r.day_of_week == target_day))
}
