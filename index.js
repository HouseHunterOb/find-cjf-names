const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

async function scrapeWithPuppeteer(url, clientName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    // Interactúa con la página para buscar el cliente
    await page.type('input[name="nombre_campo"]', clientName); // Cambia 'nombre_campo' al selector correcto
    await page.click('button[type="submit"]'); // Cambia al selector del botón de búsqueda

    // Espera a que los resultados se carguen
    await page.waitForSelector('.resultado_clase'); // Cambia al selector de los resultados

    // Extrae el HTML de la página
    const content = await page.content();
    await browser.close();

    return content;
}

async function extractData(html) {
    const $ = cheerio.load(html);
    const cases = [];

    // Extrae los datos de cada caso
    $('.resultado_clase').each((index, element) => { // Cambia al selector correcto
        const expediente = $(element).find('expediente_selector').text(); // Cambia al selector correcto
        const tipoJuicio = $(element).find('tipo_selector').text(); // Cambia al selector correcto

        cases.push({ expediente, tipoJuicio });
    });

    return cases;
}

async function main() {
    const url = 'https://www.serviciosenlinea.pjf.gob.mx/juicioenlinea/juicioenlinea';
    const clientName = 'Nombre del Cliente';

    const html = await scrapeWithPuppeteer(url, clientName);
    const cases = await extractData(html);

    console.log('Casos encontrados:', cases);

    // Opcional: Guardar en un archivo CSV
    const fs = require('fs');
    const csv = cases.map(c => `${c.expediente},${c.tipoJuicio}`).join('\n');
    fs.writeFileSync('resultados.csv', csv);

    console.log('Resultados guardados en resultados.csv');
}

main().catch(console.error);
