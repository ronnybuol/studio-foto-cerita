// NatGeo photo-story spreads are displayed without cropping, editing or added overlays.
// Binary JPEG assets are uploaded by trainer directly to the existing Cloudflare R2.
const base="/lensa-muda/api/portfolio/spread/";
export const NATGEO_SPREADS=Object.freeze([1,2,3,4,5]);
export function portfolioViewerHTML(page=1,variant="participant"){
 const n=NATGEO_SPREADS.includes(page)?page:1;
 return `<section class="natgeo-portfolio natgeo-portfolio-${variant}" aria-label="Portofolio National Geographic Hudog Pekayang">
 <header><span class="eyebrow">PORTOFOLIO · RONNY ADOLof BUOL · NATIONAL GEOGRAPHIC</span>
 <h2>Hudog Pekayang — cerita dalam layout majalah</h2>
 <p>Amati bagaimana foto, teks, ruang kosong dan urutan spread membentuk pengalaman membaca. Spread tampil utuh tanpa dipotong.</p></header>
 <div class="natgeo-portfolio-stage"><img src="${base+n}" alt="Spread ${n} dari lima halaman portofolio Hudog Pekayang — karya foto Ronny Adolof Buol" loading="${n===1?"eager":"lazy"}" decoding="async"></div>
 <div class="natgeo-portfolio-controls">
 <span class="natgeo-page-label">SPREAD ${String(n).padStart(2,"0")} / 05</span>
 ${NATGEO_SPREADS.map(i=>`<button type="button" data-portfolio-page="${i}" aria-pressed="${n===i}" class="btn small ${n===i?"primary":"subtle"}">${String(i).padStart(2,"0")}</button>`).join("")}
 </div><p class="small-note">Foto dan layout digunakan sebagai referensi pembelajaran sesuai izin pemilik karya. Klik gambar untuk melihat ukuran penuh.</p>
 </section>`;
}
export function portfolioTrainerHTML(page=0,isMentor=false){
 return `<section class="card natgeo-trainer-panel" id="natgeo-trainer-panel">
 <span class="eyebrow">PEMBUKA MODUL 04 · PORTOFOLIO NATIONAL GEOGRAPHIC</span>
 <h2>Hudog Pekayang — lima spread asli</h2>
 <p>Tampilkan kelima spread di LCD sebelum masuk materi Sembilan Bingkai. Penayangan tidak menggeser indeks slide Modul 04–06.</p>
 <div class="natgeo-portfolio-controls"><button type="button" class="btn subtle" data-portfolio-project="0" ${isMentor?"disabled":""}>Tutup portofolio di LCD</button>
 ${NATGEO_SPREADS.map(i=>`<button type="button" data-portfolio-project="${i}" class="btn ${page===i?"primary":"subtle"}" ${isMentor?"disabled":""}>${String(i).padStart(2,"0")}</button>`).join("")}</div>
 <p id="natgeo-project-status" class="small-note">${page?"Sedang menampilkan spread "+page+" di LCD.":"LCD mengikuti materi atau sorotan biasa."}</p>
 ${isMentor?"":`<details class="natgeo-upload-tools"><summary>Kelola lima gambar asli portofolio (JPG)</summary>
 <p>Unggah kelima file sekaligus dengan nama berurutan (1) sampai (5). Tidak ada perubahan gambar atau layout.</p>
 <input type="file" id="natgeo-upload-input" accept=".jpg,.jpeg,image/jpeg" multiple>
 <p id="natgeo-upload-status" class="small-note" role="status" aria-live="polite">Memeriksa lima file di penyimpanan…</p>
 </details>`}
 <div id="natgeo-upload-availability" class="small-note">Memeriksa spread yang sudah tersedia…</div>
 </section>`;
}
