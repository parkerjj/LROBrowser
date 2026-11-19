// Benchmark kernel for SPR 2.1 indexed frames. The game still uses its JS loader.
pub(crate) fn decode(input: &[u8], output: &mut [u8]) -> Option<()> {
    output.fill(0);
    let mut input = input;
    let mut position = 0;
    while let Some((&pixel, tail)) = input.split_first() {
        input = tail;
        if pixel != 0 {
            *output.get_mut(position)? = pixel;
            position += 1;
            continue;
        }
        let (&count, tail) = input.split_first()?;
        input = tail;
        // The original loader treats an encoded count of zero as two zero pixels.
        let run = if count == 0 { 2 } else { usize::from(count) };
        position = position.checked_add(run)?;
        if position > output.len() {
            return None;
        }
    }
    Some(())
}

#[cfg(test)]
mod tests {
    use super::decode;

    #[test]
    fn supports_zero_runs_and_padding_without_reusing_old_pixels() {
        let mut output = [99; 8];
        assert_eq!(decode(&[12, 0, 0, 9, 0, 3], &mut output), Some(()));
        assert_eq!(output, [12, 0, 0, 9, 0, 0, 0, 0]);
    }

    #[test]
    fn rejects_truncated_or_oversized_runs() {
        assert_eq!(decode(&[0], &mut [0; 2]), None);
        assert_eq!(decode(&[0, 4], &mut [0; 3]), None);
        assert_eq!(decode(&[1, 2], &mut [0; 1]), None);
    }
}
