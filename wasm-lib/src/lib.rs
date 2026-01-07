use wasm_bindgen::prelude::*;
use image::codecs::gif::GifDecoder;
use image::{AnimationDecoder, DynamicImage, GenericImageView};
use std::io::Cursor;

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

const ASCII_CHARS: &[u8] = b"@%#*+=-:. ";

#[wasm_bindgen]
pub fn convert_gif_to_ascii(data: &[u8], scale_width: u32) -> Result<Vec<String>, JsValue> {
    let cursor = Cursor::new(data);
    let decoder = GifDecoder::new(cursor).map_err(|e| e.to_string())?;
    let frames = decoder.into_frames();
    let frames = frames.collect_frames().map_err(|e| e.to_string())?;
    let mut ascii_frames = Vec::new();

    // iterate through every frame in the gif
    for frame in frames {
        let buffer = frame.buffer();
        let dynamic_image = DynamicImage::ImageRgba8(buffer.clone());

        // calculate dimensions
        let (width, height) = dynamic_image.dimensions();
        let aspect_ratio = height as f32 / width as f32;
        let scale_height = (scale_width as f32 * aspect_ratio * 0.5) as u32; // halve height to fix stretching

        // resize and grayscale
        let resized = dynamic_image.thumbnail_exact(scale_width, scale_height);
        let gray_image = resized.to_luma8();

        // pixel to character mapping
        let mut ascii_string = String::new();

        for (x, y, pixel) in gray_image.enumerate_pixels() {
            // new line if at start of new row
            if x == 0 && y > 0 {
                ascii_string.push('\n');
            }

            // get brightness (0-255)
            let brightness = pixel[0] as usize;

            // map brightness to the ASCII_CHARS array
            let char_index = (brightness * (ASCII_CHARS.len() - 1)) / 255;

            ascii_string.push(ASCII_CHARS[char_index] as char);
        }

        // add frame to list
        ascii_frames.push(ascii_string);
    }

    Ok(ascii_frames)
}