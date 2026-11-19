"""Rebuild embedded PNG flags from the MIT-licensed flag-icons npm package.
Usage: python tools/build-race-flags.py /path/to/unpacked/package
Requires CairoSVG and Pillow only for rebuilding; shipped app has no dependency.
"""
from pathlib import Path
import base64,json,re,shutil,sys,io
import cairosvg
from PIL import Image
source=Path(sys.argv[1]);root=Path(__file__).resolve().parent.parent;flags={}
for file in sorted((source/'flags/4x3').glob('*.svg')):
 if not re.fullmatch('[a-z]{2}',file.stem):continue
 png=cairosvg.svg2png(url=str(file),output_width=96,output_height=72)
 image=Image.open(io.BytesIO(png)).convert('RGBA');buf=io.BytesIO();image.save(buf,format='PNG',optimize=True)
 flags[file.stem.upper()]='data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
(root/'src/race-flags.js').write_text('// flag-icons 7.6.0 by Panayiotis Lipiridis, MIT. Rasterised at 96 × 72.\nexport const RACE_FLAGS=Object.freeze('+json.dumps(flags,separators=(',',':'))+');\n')
shutil.copy(source/'LICENSE',root/'vendor/flag-icons/LICENSE')
print('Bundled',len(flags),'PNG flags;',sum(len(v) for v in flags.values()),'data-URI characters')
