function capitalizeWords(str) {
  return str
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function generatePageHtmlAndScss(page, frame = { width: 1280, height: 800 }) {
  let html = `<!-- HTML generado para ${page.name} -->\n<div class="page">\n`;
  let scss = `/* SCSS generado para ${page.name} */\n\n.page {\n  position: relative;\n  width: 100vw;\n  height: 100vh;\n  overflow: hidden;\n}\n\n`;

  const scaleX = 100 / frame.width;  // vw por pixel
  const scaleY = 100 / frame.height; // vh por pixel

  for (const element of page.elements) {
    const className = `el-${element.id}`;
    const top = (element.y * scaleY).toFixed(2) + "vh";
    const left = (element.x * scaleX).toFixed(2) + "vw";
    const width = (element.width * scaleX).toFixed(2) + "vw";
    const height = (element.height * scaleY).toFixed(2) + "vh";

    const baseStyles = `
.${className} {
  position: absolute;
  top: ${top};
  left: ${left};
  width: ${width};
  height: ${height};
  ${element.color ? `background-color: ${element.color};` : ""}
  ${element.textColor ? `color: ${element.textColor};` : ""}
  ${element.borderRadius !== undefined ? `border-radius: ${element.borderRadius}px;` : ""}
  ${element.borderColor && element.borderWidth !== undefined ? `border: ${element.borderWidth}px solid ${element.borderColor};` : ""}
}
`;

    switch (element.type) {
      case "boton":
        html += `  <button class="${className}">${element.text || "Botón"}</button>\n`;
        scss += baseStyles;
        break;

      case "input":
        html += `  <input class="${className}" placeholder="${element.text || ""}" />\n`;
        scss += baseStyles;
        break;

      case "select":
        html += `  <select class="${className}"><option>${element.text || "Seleccionar..."}</option></select>\n`;
        scss += baseStyles;
        break;

      case "search":
        html += `  <input type="search" class="${className}" placeholder="${element.text || ""}" />\n`;
        scss += baseStyles;
        break;

      case "checkbox":
        html += `  <label class="${className}"><input type="checkbox" /> ${element.text || ""}</label>\n`;
        scss += baseStyles;
        break;

      case "radio":
        html += `  <label class="${className}"><input type="radio" /> ${element.text || ""}</label>\n`;
        scss += baseStyles;
        break;

      case "alert":
        html += `  <div class="${className}">${element.text || "¡Alerta!"}</div>\n`;
        scss += baseStyles;
        break;

      case "card":
        html += `  <div class="${className}">\n    <h3>${element.text || "Título"}</h3>\n    <p>${element.description || ""}</p>\n  </div>\n`;
        scss += baseStyles;
        break;

      case "tabla":
        html += `  <div class="${className}">[Tabla de ejemplo]</div>\n`;
        scss += baseStyles;
        break;

      case "linea":
        html += `  <div class="${className}"></div>\n`;
        const lineaHeight = element.isVertical
          ? `${(element.height * scaleY).toFixed(2)}vh`
          : `${(element.borderWidth || 2) * scaleY}vh`;
        const lineaWidth = element.isVertical
          ? `${(element.borderWidth || 2) * scaleX}vw`
          : `${(element.width * scaleX).toFixed(2)}vw`;
        scss += `
.${className} {
  position: absolute;
  top: ${top};
  left: ${left};
  width: ${lineaWidth};
  height: ${lineaHeight};
  background-color: ${element.color || "#000"};
}
`;
        break;

      case "texto":
        html += `  <div class="${className}">${element.text || ""}</div>\n`;
        scss += `
.${className} {
  position: absolute;
  top: ${top};
  left: ${left};
  font-size: ${element.fontSize || 16}px;
  font-weight: ${element.fontWeight || "normal"};
  color: ${element.textColor || "#000"};
}
`;
        break;

      case "imagen":
      case "icono":
        html += `  <img src="${element.src}" alt="${element.alt || ""}" class="${className}" />\n`;
        scss += `
.${className} {
  position: absolute;
  top: ${top};
  left: ${left};
  width: ${width};
  height: ${height};
  object-fit: cover;
  border-radius: ${element.borderRadius || 0}px;
}
`;
        break;

      case "rectangulo":
        html += `  <div class="${className}"></div>\n`;
        scss += baseStyles;
        break;

      default:
        html += `  <div class="${className}">${element.text || ""}</div>\n`;
        scss += baseStyles;
        break;
    }
  }

  html += `</div>\n`;
  return { html, scss };
}


function generateReadme(pages) {
  const routes = pages.map((p) => {
    const route = slugify(p.name);
    const componentName = capitalizeWords(p.name);
    const fileName = `page-${route}.component.ts`;
    return `- \`/${route}\` → Componente: \`${componentName}Component\` en \`generated-design/page-${route}/${fileName}\``;
  });

  return `# 🧩 Generated Angular Design

Este diseño fue generado automáticamente por tu herramienta CASE.

## ✅ Requisitos

- Node.js 18+ y npm instalado
- Angular CLI instalado globalmente:

  \`\`\`bash
  npm install -g @angular/cli
  \`\`\`

## 🚀 Cómo usar este diseño en un proyecto Angular

### 1. Crear un nuevo proyecto Angular (si no tienes uno)

\`\`\`bash
ng new nombre-del-proyecto --style=scss --routing
\`\`\`

> 📌 Asegúrate de elegir **SCSS** como formato de estilos y habilitar el sistema de **rutas**.

---

### 2. Copiar los archivos generados

- Extrae el ZIP exportado.
- Copia la carpeta \`generated-design/\` dentro de \`src/app/\` de tu proyecto Angular.

Tu estructura debe quedar así:

\`\`\`
src/
└── app/
    ├── generated-design/
    │   ├── page-<nombre>/
    │   ├── generated-design.module.ts
    │   └── generated-design-routing.module.ts
    └── app.routes.ts
\`\`\`

---

### 3. Registrar el módulo y las rutas generadas

#### Si usas Angular 17+ (app.routes.ts y app.config.ts)

\`\`\`ts
import { Routes } from '@angular/router';
${pages.map(p => {
    const componentName = capitalizeWords(p.name);
    const slug = slugify(p.name);
    return `import { ${componentName}Component } from './generated-design/page-${slug}/page-${slug}.component';`;
  }).join('\n')}

export const routes: Routes = [
  ${pages.map(p => {
    const slug = slugify(p.name);
    const componentName = capitalizeWords(p.name);
    return `{ path: '${slug}', component: ${componentName}Component }`;
  }).join(',\n  ')},
  { path: '', redirectTo: '${slugify(pages[0].name)}', pathMatch: 'full' }
];
\`\`\`

- En \`app.config.ts\`:

\`\`\`ts
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig = {
  providers: [provideRouter(routes)]
};
\`\`\`

#### Si usas módulos tradicionales

- En \`app.module.ts\`:

\`\`\`ts
import { GeneratedDesignModule } from './generated-design/generated-design.module';

@NgModule({
  imports: [GeneratedDesignModule],
})
export class AppModule {}
\`\`\`

- En \`app-routing.module.ts\`:

\`\`\`ts
import { GeneratedDesignRoutingModule } from './generated-design/generated-design-routing.module';

@NgModule({
  imports: [RouterModule.forRoot([]), GeneratedDesignRoutingModule],
})
export class AppRoutingModule {}
\`\`\`

---

### 4. Limpiar la plantilla inicial

En \`app.component.html\`, deja solo:

\`\`\`
<router-outlet></router-outlet>
\`\`\`

---

## 🧭 Rutas disponibles

${routes.join('\n')}

---

## 📝 Notas adicionales

- El diseño generado **no incluye lógica** (solo estructura visual).
- Puedes modificar los componentes libremente.
- Compatible con Angular 15, 16 y 17.

---

Generado automáticamente por tu herramienta CASE 🛠️`;
}


module.exports = {
  capitalizeWords,
  generatePageHtmlAndScss,
  generateReadme
};