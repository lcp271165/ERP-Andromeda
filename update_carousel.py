import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the 6 slides
slides_data = [
    {"src": "assets/images/carousel_1.jpg", "alt": "Campo Base Andrómeda", "title": "Excelencia en Ingeniería y Construcción", "desc": "Soluciones integrales para proyectos de infraestructura, minería y edificaciones comerciales con los más altos estándares de calidad."},
    {"src": "assets/images/carousel_2.jpg", "alt": "Izaje de Estructuras", "title": "Excelencia en Ingeniería y Construcción", "desc": "Impulsamos el desarrollo con infraestructura de vanguardia y tecnología de punta en cada obra."},
    {"src": "assets/images/carousel_3.jpg", "alt": "Vista General del Campamento", "title": "Excelencia en Ingeniería y Construcción", "desc": "Compromiso total con la seguridad y la eficiencia en proyectos industriales de gran escala."},
    {"src": "assets/images/carousel_4.jpg", "alt": "Panorama del Proyecto", "title": "Innovación y Sostenibilidad", "desc": "Construyendo el futuro respetando el medio ambiente y las comunidades locales."},
    {"src": "assets/images/carousel_5.jpg", "alt": "Instalación de Módulos", "title": "Calidad en cada detalle", "desc": "Aplicamos las mejores prácticas en cada etapa del ciclo de vida del proyecto."},
    {"src": "assets/images/carousel_6.jpg", "alt": "Áreas Residenciales", "title": "Un equipo comprometido", "desc": "Nuestro mayor activo es nuestro talento humano, forjando el éxito de la empresa."}
]

slides_html = ""
for i, slide in enumerate(slides_data):
    slides_html += f'''<!-- Slide {i+1} -->
<div class="min-w-full h-full relative snap-start">
<div class="absolute inset-0">
<img alt="{slide['alt']}" class="w-full h-full object-cover" src="{slide['src']}"/>
<div class="absolute inset-0 bg-black/50"></div>
</div>
<div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
<div class="max-w-2xl text-white">
<h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-6">{slide['title']}</h1>
<p class="text-xl mb-10 text-gray-200">{slide['desc']}</p>
<div class="flex flex-wrap gap-4">
<a class="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-custom font-bold text-lg transition-all transform hover:scale-105 inline-block shadow-lg" href="#proyectos">Ver Proyectos</a>
<a class="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-custom font-bold text-lg transition-all inline-block" href="#contacto">Contáctanos</a>
</div>
</div>
</div>
</div>
'''

dots_html = ""
for i in range(len(slides_data)):
    if i == 0:
        css = "w-12 h-1 bg-teal rounded-full opacity-100"
    else:
        css = "w-12 h-1 bg-white/50 hover:bg-teal rounded-full transition-all"
    
    amount = f"window.innerWidth * {i}" if i > 0 else "0"
    dots_html += f'''<button class="{css}" onclick="document.getElementById('carousel').scrollTo({{left: {amount}, behavior: 'smooth'}})" data-index="{i}"></button>\n'''

# Replace the slides content inside carousel-container
carousel_content_pattern = r'(<div class="carousel-container[^>]*id="carousel"[^>]*>).*?(</div>\s*<!-- Navigation Controls -->)'

def repl_slides(m):
    return m.group(1) + "\n" + slides_html + m.group(2)

html = re.sub(carousel_content_pattern, repl_slides, html, flags=re.DOTALL)

# Replace the dots content
dots_pattern = r'(<!-- Indicators -->\s*<div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">).*?(</div>\s*</section>)'

def repl_dots(m):
    return m.group(1) + "\n" + dots_html + m.group(2)

html = re.sub(dots_pattern, repl_dots, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
