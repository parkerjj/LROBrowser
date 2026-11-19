use lro_asset_decode::{
    GatError, SprDecodeError, decode_gat, decode_indexed_frames, decode_indexed_rle, gat_layout,
    indexed_frames_output_len,
};

fn gat_fixture(width: u32, height: u32) -> Vec<u8> {
    let mut bytes = b"GRAT\x01\x02".to_vec();
    bytes.extend(width.to_le_bytes());
    bytes.extend(height.to_le_bytes());
    for value in [5.0_f32, -10.0, -0.0, 12.5] {
        bytes.extend(value.to_le_bytes());
    }
    bytes.extend(0x8000_0003_u32.to_le_bytes());
    bytes
}

#[test]
fn gat_matches_worker_height_scaling_and_high_bit_water_flags() {
    let input = gat_fixture(1, 1);
    let layout = gat_layout(&input).unwrap();
    assert_eq!(
        (layout.width, layout.height, layout.output_bytes),
        (1, 1, 20)
    );
    let mut output = [0; 20];
    decode_gat(&input, &mut output).unwrap();
    for (actual, expected) in output
        .as_chunks::<4>()
        .0
        .iter()
        .zip([1.0_f32, -2.0, -0.0, 2.5, 14.0])
    {
        assert_eq!(*actual, expected.to_le_bytes());
    }
}

#[test]
fn gat_rejects_untrusted_lengths_before_allocation() {
    let input = gat_fixture(1, 1);
    assert_eq!(gat_layout(&input[..33]), Err(GatError::Truncated));
    assert_eq!(
        gat_layout(&gat_fixture(u32::MAX, u32::MAX)),
        Err(GatError::Dimensions)
    );
    assert_eq!(decode_gat(&input, &mut [0; 19]), Err(GatError::OutputSize));
}

#[test]
fn spr_preserves_legacy_zero_runs_padding_and_buffer_reuse() {
    let mut output = [99; 8];
    decode_indexed_rle(&[12, 0, 0, 9, 0, 3], &mut output).unwrap();
    assert_eq!(output, [12, 0, 0, 9, 0, 0, 0, 0]);
    assert_eq!(
        decode_indexed_rle(&[0], &mut output),
        Err(SprDecodeError::TruncatedRun)
    );
    assert_eq!(
        decode_indexed_rle(&[0, 9], &mut output),
        Err(SprDecodeError::OutputOverflow)
    );
}

#[test]
fn spr_batches_frames_and_preserves_the_offset_to_following_rgba_or_palette() {
    let input = [
        2, 0, 2, 0, 3, 0, 7, 0, 3, // indexed 2x2
        1, 0, 1, 0, 1, 0, 5, // indexed 1x1
        42, 91, // subsequent SPR sections are untouched
    ];
    assert_eq!(indexed_frames_output_len(&input, 2), Ok(17));
    let mut output = vec![0; 17];
    decode_indexed_frames(&input, 2, &mut output).unwrap();
    assert_eq!(output, [16, 0, 0, 0, 2, 0, 2, 0, 7, 0, 0, 0, 1, 0, 1, 0, 5]);
    assert_eq!(
        indexed_frames_output_len(&input[..15], 2),
        Err(SprDecodeError::TruncatedFrame)
    );
    assert_eq!(
        indexed_frames_output_len(&[255, 255, 255, 255, 0, 0], 1),
        Err(SprDecodeError::OutputOverflow),
    );
}
