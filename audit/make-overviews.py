from PIL import Image, ImageDraw
from pathlib import Path
root=Path('audit')
for name in ['contact','quote','services-architecture','founders-message','why-us','video-gallery']:
    file=root/f'v2-mobile--{name}.jpg'
    if not file.exists(): continue
    im=Image.open(file).convert('RGB')
    panel=Image.new('RGB',(im.width*3,900),(245,243,238))
    for i,y in enumerate([0,min(1000,max(0,im.height-860)),max(0,im.height-2200)]):
        panel.paste(im.crop((0,y,im.width,min(im.height,y+860))),(i*im.width,32))
        ImageDraw.Draw(panel).text((i*im.width+8,8),f'{name}: y={y}',fill='black')
    panel.save(root/f'overview-{name}.jpg')
