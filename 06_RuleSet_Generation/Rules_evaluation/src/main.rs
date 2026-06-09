use adblock::lists::ParseOptions;
use adblock::request::Request;
use adblock::Engine;
use csv::{Reader, Writer};
use indicatif::{ProgressBar, ProgressDrawTarget, ProgressStyle};
use std::{
    fs::{self, File},
    io::{self, BufRead, BufReader},
    path::Path,
};

fn load_rules_from_file(file_path: &str) -> io::Result<Vec<String>> {
    let file = File::open(file_path)?;
    let reader = BufReader::new(file);
    Ok(reader.lines().filter_map(Result::ok).collect())
}

fn main() -> io::Result<()> {
    // ---- CONFIG ----
    const CUSTOM_RULES_PATH: &str = "rules_keys161_lookahead_5.txt";
    const EASYLIST_RULES_PATH: &str = "easylist_19052025.txt";
    const EASYPRIVACY_RULES_PATH: &str = "easyprivacy_19052025.txt";
    const CSV_PATH: &str = "CSV/negative_test.csv";
    let output_dir = Path::new("output");

    println!("Loading custom rules from: {}", CUSTOM_RULES_PATH);
    let custom_rules = load_rules_from_file(CUSTOM_RULES_PATH)?;
    println!("Loaded {} custom rules", custom_rules.len());

    println!("Loading EasyList rules from: {}", EASYLIST_RULES_PATH);
    let easylist_rules = load_rules_from_file(EASYLIST_RULES_PATH)?;
    println!("Loaded {} EasyList rules", easylist_rules.len());

    println!("Loading EasyPrivacy rules from: {}", EASYPRIVACY_RULES_PATH);
    let easyprivacy_rules = load_rules_from_file(EASYPRIVACY_RULES_PATH)?;
    println!("Loaded {} EasyPrivacy rules", easyprivacy_rules.len());

    println!("Building engines...");
    let engine_custom = Engine::from_rules(
        custom_rules.iter().map(String::as_str),
        ParseOptions::default(),
    );
    let engine_easylist = Engine::from_rules(
        easylist_rules.iter().map(String::as_str),
        ParseOptions::default(),
    );
    let engine_easyprivacy = Engine::from_rules(
        easyprivacy_rules.iter().map(String::as_str),
        ParseOptions::default(),
    );
    println!("Engines built.");

    if !output_dir.exists() {
        fs::create_dir_all(output_dir)?;
    }

    let csv_name = Path::new(CSV_PATH)
        .file_name()
        .unwrap()
        .to_string_lossy()
        .to_string();

    let out_path = output_dir.join(csv_name);
    println!("Writing output CSV to: {}", out_path.display());

    // ---- First pass: count rows for progress bar ----
    let mut count_rdr = Reader::from_path(CSV_PATH)?;
    let mut total: u64 = 0;
    for rec in count_rdr.records() {
        if let Ok(r) = rec {
            if !r.get(0).unwrap_or("").trim().is_empty() {
                total += 1;
            }
        }
    }
    println!("Total rows: {}", total);

    let pb = ProgressBar::new(total);
    pb.set_draw_target(ProgressDrawTarget::stdout());
    pb.set_style(
        ProgressStyle::default_bar()
            .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta})")
            .unwrap()
            .progress_chars("#>-"),
    );

    // ---- Second pass: real processing ----
    let mut rdr = Reader::from_path(CSV_PATH)?;
    let mut wtr = Writer::from_path(&out_path)?;

    // Write header + new columns
    let headers = rdr.headers()?.clone();
    let mut new_headers = headers.clone();
    new_headers.push_field("easylist");
    new_headers.push_field("easyprivacy");
    new_headers.push_field("custom");
    wtr.write_record(&new_headers)?;

    for rec in rdr.records() {
        let rec = match rec {
            Ok(r) => r,
            Err(_) => continue,
        };

        let url = rec.get(0).unwrap_or("").trim();

        let (easylist_blocked, easyprivacy_blocked, custom_blocked) = if url.is_empty() {
            (false, false, false)
        } else {
            match Request::new(url, "", "") {
                Ok(req) => {
                    let easylist_blocked = engine_easylist.check_network_request(&req).matched;
                    let easyprivacy_blocked = engine_easyprivacy.check_network_request(&req).matched;
                    let custom_blocked = engine_custom.check_network_request(&req).matched;
                    (easylist_blocked, easyprivacy_blocked, custom_blocked)
                }
                Err(_) => (false, false, false),
            }
        };

        // Copy original row + append new values
        let mut out_row = rec.clone();
        out_row.push_field(if easylist_blocked { "true" } else { "false" });
        out_row.push_field(if easyprivacy_blocked { "true" } else { "false" });
        out_row.push_field(if custom_blocked { "true" } else { "false" });
        wtr.write_record(&out_row)?;

        pb.inc(1);
    }

    wtr.flush()?;
    pb.finish_with_message("Done");

    println!("Finished. Output written to {}", out_path.display());
    Ok(())
}
