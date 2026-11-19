mod gat;
#[path = "spr-rle.rs"]
mod spr;

#[cfg(target_arch = "wasm32")]
mod wasm {
    use super::{gat, spr};

    #[unsafe(no_mangle)]
    pub extern "C" fn allocate(length: usize) -> *mut u8 {
        Box::into_raw(vec![0; length].into_boxed_slice()).cast()
    }

    // The benchmark passes disjoint ranges inside two live allocations.
    #[unsafe(no_mangle)]
    pub unsafe extern "C" fn decode_asset(
        kind: u32,
        input: *const u8,
        input_len: usize,
        output: *mut u8,
        output_len: usize,
    ) -> u32 {
        let input = unsafe { std::slice::from_raw_parts(input, input_len) };
        let output = unsafe { std::slice::from_raw_parts_mut(output, output_len) };
        let decoded = match kind {
            0 => spr::decode(input, output),
            1 => gat::decode(input, output),
            _ => None,
        };
        u32::from(decoded.is_some())
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    use std::{env, fs, hint::black_box, io::Read, time::Instant};

    fn read_u32(input: &mut &[u8]) -> usize {
        let mut bytes = [0; 4];
        input.read_exact(&mut bytes).unwrap();
        u32::from_le_bytes(bytes) as usize
    }

    let mut args = env::args().skip(1);
    let decode = match args.next().unwrap().as_str() {
        "spr" => spr::decode as fn(&[u8], &mut [u8]) -> Option<()>,
        "gat" => gat::decode,
        _ => panic!("unknown fixture format"),
    };
    let fixtures = fs::read(args.next().unwrap()).unwrap();
    let repetitions = args.next().unwrap().parse::<usize>().unwrap();
    let samples = args.next().unwrap().parse::<usize>().unwrap();
    let mut rest = fixtures.as_slice();
    let mut inputs = Vec::new();
    while !rest.is_empty() {
        let packed_len = read_u32(&mut rest);
        let output_len = read_u32(&mut rest);
        let (packed, tail) = rest.split_at(packed_len);
        let (expected, tail) = tail.split_at(output_len);
        rest = tail;
        let mut output = vec![0; output_len];
        decode(packed, &mut output).unwrap();
        assert_eq!(output, expected);
        inputs.push((packed, output_len));
    }
    let batch = || {
        for _ in 0..repetitions {
            for &(packed, output_len) in &inputs {
                let mut output = vec![0; output_len];
                decode(black_box(packed), &mut output).unwrap();
                black_box(output);
            }
        }
    };
    batch();
    for _ in 0..samples {
        let start = Instant::now();
        batch();
        println!("{:.6}", start.elapsed().as_secs_f64() * 1000.0);
    }
}
