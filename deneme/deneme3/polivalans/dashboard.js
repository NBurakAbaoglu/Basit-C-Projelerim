// sıra ekleme 
function addRowNumbersBelowHeader(tableSelector, headerName = 'Sıra') {
  const table = document.querySelector(tableSelector);
  if (!table) {
    console.warn('Tablo bulunamadı:', tableSelector);
    return;
  }

  const rows = table.querySelectorAll('tr');
  if (rows.length < 2) {
    console.warn('Yeterli veri satırı yok.');
    return;
  }

  let sıraIndex = -1;
  let headerRowIndex = -1;

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td, th');
    cells.forEach((cell, cellIndex) => {
      const text = cell.textContent?.trim().toLowerCase();
      if (text === headerName.toLowerCase() && sıraIndex === -1) {
        sıraIndex = cellIndex;
        headerRowIndex = rowIndex;
      }
    });
  });

  if (sıraIndex === -1 || headerRowIndex === -1) {
    console.warn(`"${headerName}" başlığı bulunamadı!`);
    return;
  }


  let counter = 1;
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    if (cells.length > sıraIndex) {
      cells[sıraIndex].textContent = counter++;
    }
    
  }

}

// Yeni bir sütun ekleyen fonksiyon
function addColumn() {
    const table = document.querySelector('.excel-table');
    const rows = table.querySelectorAll('tr');
    
    rows.forEach((row, index) => {
        // Başlık satırı için <th>, diğer satırlar için <td> oluşturuluyor
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        cell.className = 'empty-cell';
        row.appendChild(cell); // Hücre satıra ekleniyor
    });
    moveAddOrganizationButtonToRightmost();
}

function removeColumn(table){
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const cells = row.children;
        if (cells.length > 1) {
            row.removeChild(cells[cells.length - 1]); // Son hücreyi kaldır
        }
    });
}

// Textarea karakter sınırlandırma fonksiyonu
function limitCharacters(textarea, maxChars) {
    // Belirlenen maksimum karakter sayısını aşarsa kes
    if (textarea.value.length > maxChars) {
        textarea.value = textarea.value.slice(0, maxChars);
    }
}

// Klavye girdisini kontrol eden fonksiyon (ör. karakter sınırını aşmasın)
function handleKeyDown(event, textarea) {
    const maxChars = 40;

    // Özel tuşlara izin ver (silme ve ok tuşları)
    const allowedKeys = [8, 46, 37, 38, 39, 40];

    // Karakter sınırına ulaşıldıysa ve izinli tuşlardan biri değilse engelle
    if (textarea.value.length >= maxChars && !allowedKeys.includes(event.keyCode)) {
        event.preventDefault();
    }
}

// Belirli hücreleri vurgulayan (highlight) fonksiyon
function highlightCell() {
    const table = document.querySelector('.excel-table');
    if (!table) return;

    const headers = table.querySelectorAll('thead th');
    const rows = table.querySelectorAll('tbody tr');

    // Hedef başlıklar
    const targetHeaders = ['Çalışanın İdeal Kapasitesi', 'Çalışanın Mevcut Kapasitesi'];
    const targetColumnIndexes = [];

    // Belirlenen başlıkların indekslerini bul
    headers.forEach((th, index) => {
        const text = th.textContent.trim();
        if (targetHeaders.includes(text)) {
            targetColumnIndexes.push(index);
        }
    });

    if (targetColumnIndexes.length === 0) return;

    // "Ad Soyad" satırını bul
    let targetRow = null;
    rows.forEach((tr) => {
        const rowHeader = tr.querySelector('td.row-header');
        if (rowHeader && rowHeader.textContent.trim() === 'Ad Soyad') {
            targetRow = tr;
        }
    });

    if (!targetRow) return;

    // Hedef sütunlara gradient arka plan ve yazı rengi uygula
    targetColumnIndexes.forEach((colIndex) => {
        const cell = targetRow.children[colIndex];
        if (cell) {
            cell.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            cell.style.color = 'white';
        }
    });
}

highlightCell(); // Fonksiyonu çalıştır

// mevcut kurumsal kapasite ile idealkurumsal event sorgusu 
function compareCapacities() {
    const idealInput = document.querySelector('input.capacity-input.ideal');
    const mevcutInput = document.querySelector('input.capacity-input.mevcut');

    const idealValue = parseInt(idealInput.value);
    const mevcutValue = parseInt(mevcutInput.value);

    if (!isNaN(idealValue) && !isNaN(mevcutValue)) {
        if (idealValue === mevcutValue) {
            mevcutInput.style.borderColor = 'green';
        } else {
            mevcutInput.style.borderColor = 'red';
        }
    } else {
        // Değerlerden biri boşsa orijinal mavi rengi koru
        mevcutInput.style.borderColor = 'rgb(52, 152, 219)';
    }
}

// İdeal input her değiştiğinde kontrol et
document.querySelector('input.capacity-input.ideal').addEventListener('input', compareCapacities);

// Sayfa yüklendiğinde bir kez kontrol et (isteğe bağlı)
window.addEventListener('DOMContentLoaded', compareCapacities);

// Mevcut Kurumsal Kapasite input renk değişikliği
function increaseCapacityForImage(imageSrcList) {
    // Excel tablosunu seç (sınıfı "excel-table" olan tablo)
    const table = document.querySelector('table.excel-table');
    if (!table) return; // Tablo yoksa işlemi durdur

    // Tablonun tbody içindeki tüm satırları bir diziye al
    const tbodyRows = Array.from(table.tBodies[0].rows);

    // "Mevcut Kurumsal Kapasitesi" başlığına sahip olan satırı bul
    const currentCapacityRow = tbodyRows.find(row =>
        row.cells[4].textContent.trim() === "Mevcut Kurumsal Kapasitesi"
    );
    if (!currentCapacityRow) return; // Satır yoksa işlemi durdur

    // Tablo başlığındaki tüm hücreleri al (sütun index'lerine ulaşmak için)
    const headerCells = Array.from(table.tHead.rows[0].cells);

    // Her başlık sütunu için dön
    headerCells.forEach((th, colIndex) => {
        const cell = currentCapacityRow.cells[colIndex]; // Mevcut kapasite satırındaki ilgili hücre
        if (!cell) return; // Hücre yoksa geç

        // Tablodaki tüm satırlarda dönerek, aynı sütundaki hücreleri kontrol et
        for (let row of tbodyRows) {
            const checkCell = row.cells[colIndex];
            if (!checkCell) continue;

            // Hücrede bir <img> var mı kontrol et
            const img = checkCell.querySelector('img');
            if (img) {
                // Görselin dosya adını (örneğin "pie (4).png") düzgünce al
                const fileName = decodeURIComponent(new URL(img.src).pathname.split('/').pop());

                // Bu görsel dosya adı verilen liste (imageSrcList) içinde varsa:
                if (imageSrcList.includes(fileName)) {
                    // Mevcut kapasite hücresindeki input'u bul
                    const input = cell.querySelector('input.capacity-input');
                    if (input) {
                        // Mevcut değeri al, sayı değilse 0 kabul et
                        let currentValue = parseInt(input.value) || 0;

                        // Değeri 1 artır
                        input.value = currentValue + 1;

                        // Konsola bilgi yaz
                        console.log(`✔️ ${fileName} bulundu, yeni değer: ${input.value}`);
                    }

                    // Aynı sütunda başka hücrelerde aramaya gerek yok, döngüden çık
                    break;
                }
            }
        }
    });
}

// Organizasyon Ekle Sütununun Çalışma Kodları
function moveOrganizationHeader(headerElement) {
    const currentTh = headerElement.parentElement;
    const headerRow = currentTh.parentElement;
    
    // 1️⃣ Tıklanan hücrenin index'ini al
    let headerCells = Array.from(headerRow.children);
    const currentIndex = headerCells.indexOf(currentTh);

    const table = currentTh.closest('table');
    if (!table) return;

    // 2️⃣ Yeni sütun ekle (buton için)
    addColumn();

    // 3️⃣ Yeni hücreye "Organizasyon Ekle" butonu koy
    const newTh = headerRow.lastElementChild;
    newTh.innerHTML = `<div class="rotated-header" onclick="moveOrganizationHeader(this)">Organizasyon Ekle</div>`;

    // 4️⃣ Yeni sütun eklendiği için headerCells dizisini tekrar oluştur
    headerCells = Array.from(headerRow.children);

    // 5️⃣ Eski hücreye (tıklanan hücreye) textarea ekle
    const oldTh = headerCells[currentIndex];
    oldTh.innerHTML = `
        <textarea class="editable-cell" placeholder="Organizasyon adı yazın..."
            onblur="createOrganizationButton(this)"
            onkeydown="handleKeyDown(event, this)"
            oninput="limitCharacters(this, 40); resizeTextarea(this);">
        </textarea>
    `;
    oldTh.querySelector('textarea').focus();

    // 🟣 Diğer satırlardaki hücreleri güncelle
    const bodyRows = Array.from(table.tBodies[0].rows);

    bodyRows.forEach(row => {
        const labelCell = row.cells[4];
        if (!labelCell) return;

        const label = labelCell.textContent.trim();
        const targetCell = row.cells[currentIndex];

        if (!targetCell) return;

        if (label === 'Ad Soyad') {
            targetCell.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            targetCell.style.color = 'white';
        }

        if (label === 'İdeal Kurumsal Kapasitesi') {
            targetCell.innerHTML = `
                <input class="capacity-input" type="number" placeholder="0" min="0" max="100"
                    style="width: 100%; height: 40px; border: 2px solid #3498db; border-radius: 6px; background: #fff; text-align: center; font-size: 0.9rem; font-weight: 500; color: #495057; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
            `;
        }

        if (label === 'Mevcut Kurumsal Kapasitesi') {
            targetCell.innerHTML = `
                <input class="capacity-input" type="number" placeholder="0" min="0" max="100" disabled
                    style="width: 100%; height: 40px; border: 2px solid #3498db; border-radius: 6px; background: #fff; text-align: center; font-size: 0.9rem; font-weight: 500; color: #495057; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
            `;
        }
    });
}



function createOrganizationButton(inputElement) {
    const text = inputElement.value.trim();
    const th = inputElement.parentElement;
    const table = th.closest('table');
    const thead = table.querySelector('thead tr');

    if (text) {
        // Organizasyon metni varsa - Veritabanına kaydet
        console.log('🚀 GERÇEK saveOrganizationToDatabase çağrılıyor:', text);
        

        // Metin boyutuna göre yükseklik ve genişlik hesapla
        const lines = text.split('\n');
        const minHeight = 120;
        const minWidth = 30;
        const heightPerChar = 12; // Her karakter için yükseklik
        const widthPerLine = 15; // Her satır için genişlik

        // Yükseklik hesaplama - toplam karakter sayısına göre
        const totalChars = text.length;
        const calculatedHeight = Math.max(minHeight, totalChars * heightPerChar);

        // Genişlik hesaplama - satır sayısına göre
        const calculatedWidth = Math.max(minWidth, Math.min(200, lines.length * widthPerLine));

        // Hücreyi boş hücre sınıfından çıkar, organization-cell sınıfını ekle
        th.classList.remove('empty-cell');
        th.classList.add('organization-cell');

        const thIndex = Array.from(th.parentElement.children).indexOf(th);
        const tbodyRows = table.querySelectorAll('tbody tr');

        // Tüm satırlara resim ekle (sadece Ad Soyad satırından sonraki satırlara)
        for (let i = 0; i < tbodyRows.length; i++) {
            const row = tbodyRows[i];
            const firstCell = row.cells[4];
            
            // Ad Soyad satırını bul ve sonrasındaki satırlara resim ekle
            if (firstCell && firstCell.textContent.trim() === 'Ad Soyad') {
                // Ad Soyad satırından sonraki tüm satırlara resim ekle
                for (let j = i + 1; j < tbodyRows.length; j++) {
                    const cell = tbodyRows[j].children[thIndex+3];

                    if (cell && !cell.querySelector('img')) {
                        const img = document.createElement('img');
                        img.src = 'pie (2).png';
                        img.style.width = '60px';
                        img.style.height = '60px';

                        const images = [
                            'pie (2).png',
                            'pie (3).png',
                            'pie (4).png',
                            'pie (5).png',
                            'pie (6).png'
                        ];

                        let currentIndex = 0;

                        img.addEventListener('click', () => {
                            // Pie chart tipine göre modal aç (dinamik kontrol)
                            const currentSrc = img.src;
                            console.log('Pie chart tıklandı:', currentSrc);
                            
                            if (currentSrc.includes('pie (3).png')) {
                                // Çoklu beceri formu aç
                                console.log('Çoklu beceri formu açılıyor...');
                                const organizationId = cell.getAttribute('data-organization-id');
                                const row = cell.closest('tr');
                                if (row && organizationId) {
                                    const personNameCell = row.cells[4];
                                    const personName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
                                    getPersonIdFromRow(row).then(personId => {
                                        openMultiSkillModal(organizationId, personName, personId, cell);
                                    });
                                } else {
                                    console.log('Organizasyon ID veya satır bulunamadı');
                                }
                            } else {
                                // Pie (3).png değilse temel beceri formu aç
                                const decodedSrc = decodeURIComponent(currentSrc);
                                const isPie3 = decodedSrc.includes('pie (3).png') || currentSrc.includes('pie%20(3).png');
                                if (!isPie3) {
                                    console.log('Temel beceri formu açılıyor...');
                                    openTemelBecerilerModal(img);
                                } else {
                                    console.log('Pie (3).png için çoklu beceri formu zaten açıldı');
                                }
                            }
                        });
                        
                        // Pie chart'ı organizasyon durumuna göre güncelle
                        updatePieChartForOrganization(img, cell);

                        cell.appendChild(img);
                    }
                }
                break;
            }
        }

        // İçeriği buton ile değiştir
        th.innerHTML = `<button class="organization-button" onclick="editOrganization(this)" style="height: ${calculatedHeight}px; width: ${calculatedWidth}px;">${text}</button>`;
        saveOrganizationToDatabase(text);
        // "Organizasyon Ekle" butonunu en sona taşı
        setTimeout(() => {
            const table = th.closest('table');
            const thead = table.querySelector('thead tr');
            const tbody = table.querySelector('tbody');
            
            // Mevcut "Organizasyon Ekle" butonunu bul ve en sona taşı
            const existingButtons = thead.querySelectorAll('.rotated-header');
            let orgEkleButton = null;
            
            existingButtons.forEach(button => {
                if (button.textContent.trim() === 'Organizasyon Ekle') {
                    orgEkleButton = button;
                }
            });
            
            if (orgEkleButton) {
                // Mevcut butonu en sona taşı
                const currentTh = orgEkleButton.parentElement;
                const lastTh = thead.lastElementChild;
                
                if (currentTh !== lastTh) {
                    // Butonu en sona taşı
                    thead.appendChild(currentTh);
                    
                    // Tbody satırlarında da hücreleri taşı
                    const tbodyRows = tbody.querySelectorAll('tr');
                    tbodyRows.forEach(row => {
                        const currentCell = row.children[Array.from(thead.children).indexOf(currentTh)];
                        if (currentCell) {
                            row.appendChild(currentCell);
                        }
                    });
                    
                    console.log('✅ Organizasyon Ekle butonu en sona taşındı');
                } else {
                    console.log('✅ Organizasyon Ekle butonu zaten en sona');
                }
            } else {
                console.log('⚠️ Organizasyon Ekle butonu bulunamadı');
            }
        }, 100);
    } else {
        // Metin boşsa, hücreyi temizle ve "Organizasyon Ekle" butonunu ekle
        th.innerHTML = '<div class="rotated-header" onclick="moveOrganizationHeader(this)">Organizasyon Ekle</div>';
        th.classList.remove('organization-cell');
        th.classList.add('empty-cell');
    }
}
//butona organizasyon adı ile İd sini dışarıdan göndermek için kullandığım değişkenler
let temporary_organization_name =null;
let temporary_organization_İD =null;

function editOrganization(buttonElement) {
    console.log('🔍 editOrganization fonksiyonu çağrıldı');
    const text = buttonElement.textContent.trim(); // Organizasyon adı
    console.log('📝 Organizasyon adı:', text);
    
    // Organizasyon ID'sini bul
    const th = buttonElement.parentElement;
    const table = th.closest('table');
    const thead = table.querySelector('thead tr');
    const colIndex = Array.from(thead.children).indexOf(th);
    console.log('📍 Sütun indeksi:', colIndex);
    
    // Organizasyonları yükle ve ID'sini bul
    fetch('api/get_organizations.php')
        .then(response => response.json())
        .then(data => {
            console.log('📋 API yanıtı:', data);
            if (data.success) {
                console.log('🔍 Tüm organizasyonlar:', data.organizations);
                console.log('🔍 Aranan sütun indeksi:', colIndex);
                data.organizations.forEach(org => {
                    console.log(`  - "${org.name}": column_position = "${org.column_position}" (${typeof org.column_position}), parseInt = ${parseInt(org.column_position)}`);
                });
                const organization = data.organizations.find(org => parseInt(org.column_position) === colIndex);
                console.log('🔍 Bulunan organizasyon:', organization);
                if (organization) {
                    console.log('✅ Organizasyon modalı açılıyor...');
                    openOrganizationModal(organization.id, text);
                    temporary_organization_name=text;
                    temporary_organization_İD=organization.id;
                } else {
                    console.error('❌ Organizasyon bulunamadı - sütun pozisyonu ile');
                    // Fallback: organizasyonu isimle ara
                    const organizationByName = data.organizations.find(org => org.name === text);
                    if (organizationByName) {
                        console.log('✅ Organizasyon isimle bulundu:', organizationByName);
                        openOrganizationModal(organizationByName.id, text);
                    } else {
                        console.error('❌ Organizasyon isimle de bulunamadı');
                        showSuccessNotification('Organizasyon bulunamadı!', 'error');
                    }
                }
            } else {
                console.error('❌ Organizasyonlar yüklenemedi:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Organizasyon yükleme hatası:', error);
        });
}

// Organizasyon modal fonksiyonları
function openOrganizationModal(organizationId, organizationName) {
    console.log('🔄 Organizasyon modalı açılıyor:', organizationId, organizationName);
    
    // Modal elementini bul
    const modal = document.getElementById('organizationModal');
    if (!modal) {
        console.error('❌ organizationModal elementi bulunamadı!');
        return;
    }
    console.log('✅ Modal elementi bulundu');
    
    // Modal alanlarını doldur
    const organizationIdField = document.getElementById('organizationId');
    const organizationNameField = document.getElementById('organizationName');
    temporary_organization_name =organizationName;
    temporary_organization_İD =organizationId;
    if (organizationIdField) {
        organizationIdField.value = organizationId;
        console.log('✅ Organization ID alanı dolduruldu:', organizationId);
    } else {
        console.error('❌ organizationId elementi bulunamadı!');
    }
    
    if (organizationNameField) {
        organizationNameField.value = organizationName;
        console.log('✅ Organization Name alanı dolduruldu:', organizationName);
    } else {
        console.error('❌ organizationName elementi bulunamadı!');
    }
    
    // Temel becerileri yükle
    loadOrganizationSkills(organizationId);
    
    // Modalı göster
    modal.style.display = 'block';
    console.log('✅ Modal görünür yapıldı');
    
}

function closeOrganizationModal() {
    const modal = document.getElementById('organizationModal'); // modal elementi seç
    if (modal) {
        const event = new Event('modalClosed');
        modal.dispatchEvent(event); // event'i modal elementinde tetikle
    }

    modal.style.display = 'none';

    // Form alanlarını temizle
    document.getElementById('organizationId').value = '';
    document.getElementById('organizationName').value = '';
    document.getElementById('newSkillName').value = '';
    document.getElementById('newSkillDescription').value = '';
    document.getElementById('existingSkills').innerHTML = '';
}


function loadOrganizationSkills(organizationId) {
    console.log('🔄 Organizasyon becerileri yükleniyor:', organizationId);
    
    fetch('get_organization_skills.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            organization_id: organizationId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Yüklenen beceriler:', data.skills);
        if (data.success) {
            displayOrganizationSkills(data.skills);
        } else {
            console.error('❌ Beceriler yüklenemedi:', data.message);
            displayOrganizationSkills([]);
        }
    })
    .catch(error => {
        console.error('❌ Beceri yükleme hatası:', error);
        displayOrganizationSkills([]);
    });
}

function displayOrganizationSkills(skills) {
    console.log('🔄 Organizasyon becerileri yükleniyor:', organizationId);
    const container = document.getElementById('existingSkills');
    console.log('✅ displayOrganizationSkills çağrıldı. Beceri sayısı:', skills.length);
console.table(skills);

    if (skills.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic; margin: 0;">Henüz temel beceri dersi eklenmemiş.</p>';
        return;
    }
    
    let html = '<div style="max-height: 200px; overflow-y: auto;">';
    skills.forEach(skill => {
    html += `
<div style="
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 8px;
    background: white;
    position: relative;
">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
            <strong id="skill-name-${skill.id}" style="color: #333;">${skill.skill_name}</strong>
            ${skill.skill_description ? `<p id="skill-description-${skill.id}" style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${skill.skill_description}</p>` : ''}
        </div>
        <div style="display: flex; gap: 5px; margin-left: 10px;">
            <button type="button" onclick="editSkill(${skill.id})" style="
                background: #ffc107;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            " title="Beceriyi düzenle">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" onclick="deleteSkill(${skill.id})" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            " title="Beceriyi sil">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
</div>
`;
});
    html += '</div>';
    container.innerHTML = html;
     
}
// Burdan Temel Beceri Ekliyorum
function addNewSkill() {
    const organizationId = document.getElementById('organizationId').value;
    const skillName = document.getElementById('newSkillName').value.trim();
    const skillDescription = document.getElementById('newSkillDescription').value.trim();
    
    if (!skillName) {
        showSuccessNotification('Lütfen beceri adını girin!', 'warning');
        return;
    }

    if (!skillDescription) {
        showSuccessNotification('Lütfen beceri açıklamasını girin!', 'warning');
        return;
    }
    
    console.log('🔄 Yeni beceri ekleniyor:', skillName);
    
    fetch('api/save_organization_skill.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            organization_id: organizationId,
            skill_name: skillName,
            skill_description: skillDescription
        })
    })
    .then(response => response.json())
    .then(data => {
          if (data.success) {
        showSuccessNotification('Beceri başarıyla eklendi!');
        
        // Form alanlarını temizle
        document.getElementById('newSkillName').value = '';
        document.getElementById('newSkillDescription').value = '';
        
        // Becerileri yeniden yükle
        loadOrganizationSkills(organizationId);
    } else {
        // Özel hata mesajı göster
        showSuccessNotification('Bu temel beceri daha önce tanımlanmış!', 'error');
    }
    })
    .catch(error => {
        console.error('❌ Beceri ekleme hatası:', error);
        showSuccessNotification('Beceri ekleme hatası: ' + error.message, 'error');
    });
    const btn = document.querySelector('button[onclick="editSkill(organizationId,skillName)"]');
}
// Burdan da temel beceriyi düzenle butonuna basıp düzenliyorum
function editSkill(id) {
  const nameElem = document.getElementById(`skill-name-${id}`);
  const descElem = document.getElementById(`skill-description-${id}`);

  if (!nameElem || !descElem) {
    console.error('Elemanlar bulunamadı!');
    return;
  }

  const currentName = nameElem.textContent.trim();
  const currentDesc = descElem.textContent.trim();

  // input ve textarea oluştur
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = currentName;
  nameInput.style = 'font-size: 14px; padding: 4px 6px; width: 90%; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 6px;';

  const descInput = document.createElement('textarea');
  descInput.value = currentDesc;
  descInput.rows = 3;
  descInput.style = 'font-size: 13px; padding: 4px 6px; width: 90%; border: 1px solid #ccc; border-radius: 4px; resize: vertical;';

  // Mevcut elementlerin yerine inputları koy
  const parent = nameElem.parentElement;
  parent.innerHTML = ''; // içeriği temizle
  parent.appendChild(nameInput);
  parent.appendChild(descInput);
  nameInput.focus();

  // Güncelleme işlemi, örneğin textarea ya da input dışına tıklayınca veya bir butonla yapılabilir
  // Burada input blur olayına bağlı olarak değil, örneğin "Enter" tuşuyla ya da bir "Kaydet" butonuyla yapılması daha doğru olur

  // Basitçe, nameInput ve descInput'un blur olayını dinleyelim ve 2 alanda da değişiklik varsa backend'e gönderelim:
  function saveChanges() {
    const newName = nameInput.value.trim();
    const newDesc = descInput.value.trim();

    if (newName === '' || newDesc === '') {
      alert('İsim ve açıklama boş olamaz!');
      return;
    }

   fetch('api/update_organization_skill.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    skill_id: id,
    skill_name: newName,
    skill_description: newDesc
  }),
})
.then(res => res.text())  // önce metin olarak al
.then(text => {
  console.log("Sunucudan gelen ham cevap:", text);  // gelen cevabı konsola yazdır

  try {
    const data = JSON.parse(text);  // JSON olarak parse et

    if (data.success) {
      // Başarılı ise inputları eski elementlere dönüştür
      parent.innerHTML = `
        <strong id="skill-name-${id}" style="color: #333;">${newName}</strong>
        <p id="skill-description-${id}" style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${newDesc}</p>
      `;
      showSuccessNotification('Beceri başarıyla güncellendi.');
    } else {
      alert('Güncelleme başarısız! ' + (data.message || ''));
      // Eski haline döndür
      parent.innerHTML = `
        <strong id="skill-name-${id}" style="color: #333;">${currentName}</strong>
        <p id="skill-description-${id}" style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${currentDesc}</p>
      `;
    }
  } catch (e) {
    console.error("JSON parse hatası:", e);
    alert("Sunucudan geçersiz JSON geldi. Gelen veri konsola bakınız.");
  }
})
.catch(err => {
  console.error('Sunucu hatası:', err);
  alert('Sunucu hatası: ' + err.message);
  parent.innerHTML = `
    <strong id="skill-name-${id}" style="color: #333;">${currentName}</strong>
    <p id="skill-description-${id}" style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${currentDesc}</p>
  `;
});
  }

  // Mesela, textarea ya da input dışına tıklanınca veya Enter basılınca kaydedelim:

  let timeoutId;

  nameInput.addEventListener('blur', () => {
    timeoutId = setTimeout(saveChanges, 200);
  });

  descInput.addEventListener('blur', () => {
    timeoutId = setTimeout(saveChanges, 200);
  });

  // Eğer kullanıcı başka inputa tıklarsa, saveChanges tekrar çağrılır ama aynı anda çakışmayı önlemek için clearTimeout yapabiliriz:
  nameInput.addEventListener('focus', () => {
    clearTimeout(timeoutId);
  });
  descInput.addEventListener('focus', () => {
    clearTimeout(timeoutId);
  });

  // Dilersen Enter tuşuna basınca da kaydedebilirsin:
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges();
    }
  });

  descInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter yeni satır eklesin
      return;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges();
    }
  });
}

function deleteSkill(skillId) {
    if (!confirm('Bu beceriyi silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    console.log('🔄 Beceri siliniyor:', skillId);
    
    fetch('api/delete_organization_skill.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            skill_id: skillId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessNotification('✅ ' + data.message);
            console.log('Silme API yanıtı:', data);
            // Becerileri yeniden yükle
            const organizationId = document.getElementById('organizationId').value;
            loadOrganizationSkills(organizationId);
        } else {
            // Başarısızsa uyarı gösterelim
            showSuccessNotification('⚠️ ' + data.message, 'error');
            console.log('Beceri silinemedi: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Beceri silme hatası:', error);
        showSuccessNotification('Beceri silme hatası: ' + error.message, 'error');
    });
}


// Bu fonksiyon kaldırıldı - aşağıda güncellenmiş versiyonu var
function save_button() {
    const newOrganizationName = document.getElementById('organizationName').value.trim();
    if (!temporary_organization_name || !temporary_organization_İD) {
        console.error('Organizasyon ID ve adı gerekli');
         console.log(`Organizasyon Adı ${temporary_organization_name}`+ "ve"+`Organizasyonun İd si ${temporary_organization_İD}`)
        return;
    }
   console.log(temporary_organization_name); 
// Bu, <input id="organizationName" ...> gibi bir DOM elementi gösterir.


    fetch('api/update_organization.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            organization_id: temporary_organization_İD,
            organization_name: newOrganizationName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ ' + data.message);
            showSuccessNotification("Organizasyon Başarıyla Kaydedildi")
            // UI güncelleyebilirsin, örn: loadOrganizations();
        } else {
            console.error('❌ ' + data.message);
        }
    })
    .catch(error => {
        console.error('❌ Güncelleme hatası:', error);
    });
    closeOrganizationModal();
    
}


function saveOrganization(id, text) {
    const organizationId = id;
    const organizationName = text;

    if (!organizationName) {
        showSuccessNotification('Lütfen organizasyon adını girin!', 'warning');
        return;
    }

    openOrganizationModal(organizationId, organizationName);

    const modal = document.getElementById('organizationModal');

    modal.addEventListener('modalClosed', function onModalClosed() {
        const existingSkillsDiv = document.getElementById('existingSkills');
        let hasSkills = false;

        if (existingSkillsDiv) {
            if (existingSkillsDiv.children.length === 0) {
                hasSkills = false;
            } else if (
                existingSkillsDiv.children.length === 1 &&
                existingSkillsDiv.children[0].tagName.toLowerCase() === 'p' &&
                existingSkillsDiv.children[0].textContent.trim() === 'Henüz temel beceri dersi eklenmemiş.'
            ) {
                hasSkills = false;
            } else {
                hasSkills = true;
            }
        }

        if (!hasSkills) {
            secretdelete(organizationId, organizationName,
                () => {
                    console.log('Kullanıcı beceri eklemedi, organizasyon silindi');
                    alert('Organizasyon Eklenemedi. Temel Beceri Eklemeniz gerekmektedir.');
                    
                },
                (error) => {
                    console.error('Organizasyon silme hatası:', error);
                }
            );
        }

        modal.removeEventListener('modalClosed', onModalClosed);
    });
}


//organizasyonu veritabanına kaydediyor sonra burda siliyor temel beceri girilmezse
function secretdelete(organizationId, organizationName, onSuccess, onError) {
    fetch('api/delete_organizations.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organization_id: organizationId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Organizasyon başarıyla silindi!');
            if (onSuccess) onSuccess();
            setTimeout(() => {
                location.reload();
            }, 500);
            
        } else {
            console.error('Organizasyon silinemedi: ' + data.message);
            if (onError) onError(data.message);
        }
    })
    .catch(error => {
        console.error('Organizasyon silme hatası: ' + error.message);
        if (onError) onError(error);
    });
    
}



//butona basılınca organizasyon silme işlemi yapan fonkisyon 
function deleteOrganization() {
    const organizationId = document.getElementById('organizationId').value;
    const organizationName = document.getElementById('organizationName').value;
    
    if (!confirm(`"${organizationName}" organizasyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
        return;
    }
    
    console.log('🔄 Organizasyon siliniyor:', organizationId, organizationName);
    
   fetch('api/delete_organizations.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organization_id: organizationId })
})
.then(async response => {
    console.log('📡 API yanıtı alındı:', response.status);
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("JSON parse hatası. Sunucudan gelen cevap: " + text);
    }
})
.then(data => {
    console.log('📋 Silme sonucu:', data);
    if (data.success) {
        showSuccessNotification('Organizasyon başarıyla silindi!');
        closeOrganizationModal();
        setTimeout(() => {
            loadOrganizations();
            setTimeout(() => window.location.reload(), 500);
        }, 500);
    } else {
        showSuccessNotification('Organizasyon silinemedi: ' + data.message, 'error');
    }
})
.catch(error => {
    console.error('❌ Organizasyon silme hatası:', error);
    showSuccessNotification('Organizasyon silme hatası: ' + error.message, 'error');
});

}



function closeEditPanel() {
    const panel = document.getElementById('editEventForm');
    const textarea = document.getElementById('editEventDescription');
    const lessonNameInput = document.getElementById('multiSkillLessonName');

    panel.style.display = 'none';

    if (panel.currentButton) {
        // Etkinlik adı değişikliğini kaydet
        if (lessonNameInput && lessonNameInput.value.trim() !== '') {
            panel.currentButton.textContent = lessonNameInput.value.trim();
        }
        
        // Açıklama değişikliğini kaydet (eğer varsa)
        if (textarea && textarea.value.trim() !== '') {
            // Açıklama için ayrı bir alan varsa buraya eklenebilir
            console.log('Açıklama:', textarea.value.trim());
        }
    }
    panel.currentButton = null;
}

function handleKeyDown(event, textarea) {
    if (event.key === 'Enter') {
        // Enter tuşuna basıldığında yeni satır ekle
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        
        textarea.value = value.substring(0, start) + '\n' + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        
        // Textarea boyutunu otomatik ayarla
        setTimeout(() => {
            resizeTextarea(textarea);
        }, 0);
        
        event.preventDefault();
    }
}

// Textarea boyutunu otomatik ayarlayan fonksiyon
function resizeTextarea(textarea) {
    const lines = textarea.value.split('\n'); // Satırları diziye çevir
    const totalChars = textarea.value.length; // Toplam karakter sayısı
    const heightPerChar = 12; // Karakter başına yükseklik
    const widthPerLine = 15; // Satır başına genişlik

    // Yüksekliği minimum 120px olacak şekilde ayarla
    const newHeight = Math.max(120, totalChars * heightPerChar);

    // Genişliği en az 30px, en fazla 200px olacak şekilde ayarla
    const newWidth = Math.max(30, Math.min(200, lines.length * widthPerLine));

    // Textarea'ya yeni boyutları uygula
    textarea.style.height = newHeight + 'px';
    textarea.style.width = newWidth + 'px';
}

// İsim hücresine tıklanınca input gösterir (sadece boş hücrelerde)
function addNameRow(clickedCell) {
    // Eğer hücre boşsa, input kutusu aç
    if (!clickedCell.textContent.trim()) {
        clickedCell.innerHTML = `
            <input type="text" class="name-input" placeholder="İsim yazın..."
                   onblur="createNameText(this)"
                   onkeydown="handleNameKeyDown(event, this)">
        `;
        clickedCell.querySelector('input').focus(); // Input'a odaklan
    } else {
        // Eğer hücrede zaten isim varsa, ismi düzenle
        const personName = clickedCell.textContent.trim();
        editPersonName(clickedCell, personName);
    }
}



// Input'tan alınan ismi hücreye yazan fonksiyon isim girerken kullanılır 
function createNameText(inputElement) {
    const text = inputElement.value.trim(); // Girilen metin
    const td = inputElement.parentElement;  // TD hücresi

    if (text) {
        saveNameToDatabase(text); 

        // İsim metni ekle ve tıklanabilir yap
        td.textContent = text;
        td.onclick = function () { 
            editPersonName(td, text); 
        };
        td.style.cursor = 'pointer';
        td.title = 'İsmi düzenlemek için tıklayın';
        
        const tr = td.parentElement;
        const tds = tr.querySelectorAll('td');

        const table = document.querySelector('.excel-table');
        const headerCells = table.querySelectorAll('thead th');

        for (let i = 7; i < tds.length; i++) {
            const currentTd = tds[i];

            // Eğer hücrede resim yoksa ekle
            if (!currentTd.querySelector('img')) {
                const button = document.createElement('button');
                button.style.border = 'none';
                button.style.background = 'transparent';
                button.style.padding = '0';
                button.style.cursor = 'pointer';

                const img = document.createElement('img');
                img.src = 'pie (2).png';  // Varsayılan resim
                img.alt = 'Resim';
                img.style.width = '60px';
                img.style.height = '60px';

                button.appendChild(img);

                button.addEventListener('click', () => {
                    // Pie chart tipine göre modal aç (dinamik kontrol)
                    const currentSrc = img.src;
                    console.log('Pie chart tıklandı:', currentSrc);
                    
                    if (currentSrc.includes('pie (3).png')) {
                        // Çoklu beceri formu aç
                        console.log('Çoklu beceri formu açılıyor...');
                        const organizationId = currentTd.getAttribute('data-organization-id');
                        const row = currentTd.closest('tr');
                        if (row && organizationId) {
                            const personNameCell = row.cells[4];
                            const personName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
                            getPersonIdFromRow(row).then(personId => {
                                openMultiSkillModal(organizationId, personName, personId, currentTd);
                            });
                        } else {
                            console.log('Organizasyon ID veya satır bulunamadı');
                        }
                    } else {
                        // Temel beceri formu aç
                        console.log('Temel beceri formu açılıyor...');
                        openTemelBecerilerModal(img);
                    }
                });
                
                // Pie chart'ı organizasyon durumuna göre güncelle
                updatePieChartForOrganization(img, currentTd);

                currentTd.appendChild(button);

                // Artık veritabanına POST yapılmıyor
            }
        }

        // En alta boş satır ekle
        setTimeout(() => {
            addEmptyNameRow();
        }, 100);

    } else {
        td.innerHTML = '';
        td.onclick = function () { addNameRow(this); };
        
        // Bulunduğumuz satır (tr)
        const tr = td.parentElement;
        
        // Tabloyu al
        const table = document.querySelector('.excel-table');
        
        // Satırın bir altındaki satırı al
        const nextTr = tr.nextElementSibling;
        
        // Eğer alt satır varsa ve boş satır ise (isteğe bağlı kontrol)
        if (nextTr && nextTr.classList.contains('empty-row')) {
            table.removeChild(nextTr);
        }
    }
}






// Input içindeyken Enter tuşuna basıldığında blur (kaydet) işlemini tetikler
function handleNameKeyDown(event, input) {
    if (event.key === 'Enter') {
        input.blur(); // Input'u kapat, createNameText çalışır
        event.preventDefault(); // Form gönderimini engelle
    }
}

function saveOrganizationToDatabase(organizationName) {
    console.log('🔄 Organizasyon kaydediliyor:', organizationName);
    
    if (!organizationName || organizationName.trim() === '') {
        console.error('❌ Organizasyon adı boş olamaz!');
        return;
    }
    
    const table = document.querySelector('.excel-table');
    const thead = table.querySelector('thead tr');
    
    // Önce textarea'nın bulunduğu th'yi bul
    let currentTh = null;
    const textareas = document.querySelectorAll('.editable-cell');
    if (textareas.length > 0) {
        const lastTextarea = textareas[textareas.length - 1];
        currentTh = lastTextarea.closest('th');
    }
    
    if (!currentTh) {
        const organizationCells = document.querySelectorAll('.organization-cell');
        if (organizationCells.length > 0) {
            currentTh = organizationCells[organizationCells.length - 1];
        }
    }
    
    let columnPosition = 0;
    if (currentTh) {
        const ths = Array.from(thead.children);
        columnPosition = ths.indexOf(currentTh);
        console.log('📍 Sütun pozisyonu:', columnPosition);
    } else {
        const ths = Array.from(thead.children);
        columnPosition = ths.length - 1;
        console.log('📍 Son sütun pozisyonu kullanılıyor:', columnPosition);
    }
    
    fetch('api/save_organization.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            organization_name: organizationName.trim(),
            column_position: columnPosition
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Organizasyon başarıyla kaydedildi:', data);
            const organizationId = data.organization_id;
            console.log('Yeni organizasyon ID:', organizationId);
            saveOrganization(organizationId, organizationName);
        } else {
            console.error('❌ Organizasyon kaydedilemedi:', data.message);
            showSuccessNotification('Organizasyon kaydedilemedi: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Organizasyon kaydetme hatası:', error);
        showSuccessNotification('Organizasyon kaydetme hatası: ' + error.message, 'error');
    });
}









// Resmi değiştir ve veritabanına kaydet
/*function changeImageAndSave(imgElement, personName, organizationName) {
    console.log('🔄 Resim değiştiriliyor:', personName, organizationName);
    
    const images = [
        'pie (2).png',
        'pie (3).png', 
        'pie (4).png',
        'pie (5).png',
        'pie (6).png'
    ];
    
    // Mevcut resmin indeksini bul
    const currentSrc = imgElement.src;
    const currentImageName = currentSrc.split('/').pop();
    let currentIndex = images.indexOf(currentImageName);
    
    // Eğer resim bulunamazsa veya son resimse, başa dön
    if (currentIndex === -1 || currentIndex === images.length - 1) {
        currentIndex = 0;
    } else {
        currentIndex++;
    }
    
    // Yeni resmi ayarla
    const newImageName = images[currentIndex];
    imgElement.src = newImageName;
    
    // Veritabanına kaydet
    saveImageToDatabase(personName, organizationName, newImageName);
}
*/
// Sütun indeksine göre organizasyon adını getir
function getOrganizationNameByColumnIndex(columnIndex) {
    const table = document.querySelector('.excel-table');
    if (!table) return '';
    
    const thead = table.querySelector('thead tr');
    const targetTh = thead.children[columnIndex];
    
    if (targetTh && targetTh.classList.contains('organization-cell')) {
        const button = targetTh.querySelector('.organization-button');
        if (button) {
            return button.textContent.trim();
        }
    }
    
    return '';
}

// Resmi veritabanına kaydetme fonksiyonu
function saveImageToDatabase(personName, organizationName, imageName) {
    console.log('📤 Resim kaydediliyor:', personName, organizationName, imageName);
    
    fetch('api/save_person_organization_image.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            person_name: personName,
            organization_name: organizationName,
            image_name: imageName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Resim başarıyla kaydedildi:', data.message);
        } else {
            console.error('❌ Resim kaydedilemedi:', data.message);
        }
    })
    .catch(error => {
        console.error('❌ Resim kaydetme hatası:', error);
    });
}

// İsmi veritabanına kaydetme fonksiyonu
function saveNameToDatabase(personName) {
    console.log('📤 Kişi adı kaydediliyor:', personName);
    
    if (!personName || personName.trim() === '') {
        console.error('❌ Kişi adı boş olamaz!');
        return;
    }
    
    fetch('api/save_person.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            person_name: personName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Kişi başarıyla kaydedildi:', data.person_name);
        } else {
            console.error('❌ Kişi kaydedilemedi:', data.message);
        }
        
    })
    .catch(error => {
        console.error('❌ Kişi kaydetme hatası:', error);
    });
}







// Organizasyonları veritabanından yükleme fonksiyonu
function loadOrganizations() {
    console.log('🔄 Organizasyonlar yükleniyor...');

    fetch('api/get_organizations.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('📋 Organizasyon listesi:', data.organizations);

            // Mevcut organizasyonları temizle
            clearExistingOrganizations();

            if (data.organizations.length > 0) {
                // Organizasyonları column_position'a göre sırala
                const sortedOrganizations = data.organizations.sort((a, b) =>
                    parseInt(a.column_position) - parseInt(b.column_position)
                );

                // Sabit sütun sayısı (ör: Ad Soyad, İdeal Kapasite, Mevcut Kapasite vs)
                const fixedColumnCount = 4;

                // Tablo ve başlık satırı
                const table = document.querySelector('.excel-table');
                const thead = table.querySelector('thead tr');

                // Şu anki sütun sayısı
                const currentColumnCount = thead.children.length;

                // Gerekli sütun sayısı: sabit sütunlar + organizasyonlar + 1 organizasyon ekle butonu
                const neededColumnCount = fixedColumnCount + sortedOrganizations.length + 1;

                // Eksik sütunları ekle
                while (thead.children.length < neededColumnCount) {
                    addColumn();
                }

                // Organizasyonların yeni sütun pozisyonları (sabit sütunlardan sonra başlıyor)
                const reorganizedOrganizations = sortedOrganizations.map((org, index) => ({
                    ...org,
                    new_column_position: index + fixedColumnCount
                }));

                console.log('🔄 Yeniden düzenlenmiş organizasyonlar:', reorganizedOrganizations);

                // Veritabanındaki column_position'ları güncelle
                updateOrganizationPositions(reorganizedOrganizations);

                // "Organizasyon Ekle" butonunu en sağa taşı
                moveAddOrganizationButtonToRightmost();

                // Organizasyonları yeni sütunlarına yerleştir
                reorganizedOrganizations.forEach(org => {
                    console.log(`🔄 Organizasyon "${org.name}" sütun ${org.new_column_position}'e yerleştiriliyor...`);
                    createOrganizationInColumn(org.name, org.new_column_position);

                    // İlgili sütundaki hücrelere resim butonu ekle
                    addPieButtonsToColumn(org.new_column_position);
                });
            }

            // "Organizasyon Ekle" butonunu en sağa taşı (yeniden garanti)
            moveAddOrganizationButtonToRightmost();

            console.log('✅ Organizasyonlar başarıyla yüklendi');
            console.log('🔄 Tablo güncellemesi tamamlandı');
        } else {
            console.error('❌ Organizasyonlar yüklenemedi:', data.message);
        }
    })
    .catch(error => {
        console.error('❌ Organizasyon yükleme hatası:', error);
    });
}

function addPieButtonsToColumn(colIndex) {
    const table = document.querySelector('.excel-table');
    const colIndexnew=colIndex+3;
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    // 4. satırdan itibaren (index 3) ekle
    for (let rowIndex = 3; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const cells = row.querySelectorAll('td');

        if (cells.length > colIndexnew) {
            const cell = cells[colIndexnew];

            // Hücrede resim yoksa ekle
            if (!cell.querySelector('img')) {
                const button = document.createElement('button');
                button.style.border = 'none';
                button.style.background = 'transparent';
                button.style.padding = '0';
                button.style.cursor = 'pointer';

                const img = document.createElement('img');
                img.src = 'pie (2).png'; // Resim yolu
                img.alt = 'Resim';
                img.style.width = '60px';
                img.style.height = '60px';

                button.appendChild(img);

                button.addEventListener('click', () => {
                    // Pie chart tipine göre modal aç (dinamik kontrol)
                    const currentSrc = img.src;
                    console.log('Pie chart tıklandı:', currentSrc);
                    
                    // URL decode yap
                    const decodedSrc = decodeURIComponent(currentSrc);
                    const isPie3 = decodedSrc.includes('pie (3).png') || currentSrc.includes('pie%20(3).png');
                    console.log('🔍 Current Src:', currentSrc);
                    console.log('🔍 Decoded Src:', decodedSrc);
                    console.log('🔍 Pie (3).png kontrolü:', isPie3);
                    
                    if (isPie3) {
                        // Çoklu beceri formu aç
                        console.log('Çoklu beceri formu açılıyor...');
                        const organizationId = cell.getAttribute('data-organization-id');
                        const row = cell.closest('tr');
                        console.log('🔍 Organization ID:', organizationId);
                        console.log('🔍 Row:', row);
                        
                        if (row && organizationId) {
                            const personNameCell = row.cells[4];
                            const personName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
                            console.log('🔍 Person Name:', personName);
                            getPersonIdFromRow(row).then(personId => {
                                openMultiSkillModal(organizationId, personName, personId, cell);
                            });
                        } else {
                            console.log('Organizasyon ID veya satır bulunamadı');
                            // Organization ID yoksa varsayılan ID kullan
                            const defaultOrgId = '1';
                            const row = cell.closest('tr');
                            if (row) {
                                const personNameCell = row.cells[4];
                                const personName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
                                console.log('🔍 Varsayılan Organization ID kullanılıyor:', defaultOrgId);
                                console.log('🔍 Row bulundu:', row);
                                console.log('🔍 Person Name:', personName);
                                openMultiSkillModal(defaultOrgId, personName, 'test', cell);
                            } else {
                                console.error('❌ Row bulunamadı!');
                            }
                        }
                    } else {
                        // Pie (3).png değilse temel beceri formu aç
                        console.log('Temel beceri formu açılıyor...');
                        openTemelBecerilerModal(img);
                    }
                });
                
                // Pie chart'ı organizasyon durumuna göre güncelle
                updatePieChartForOrganization(img, cell);

                cell.appendChild(button);
            }
        }
    }
}

// Mevcut organizasyonları temizle
function clearExistingOrganizations() {
    const table = document.querySelector('.excel-table');
    if (!table) return;
    
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Organizasyon sütunlarını bul ve tamamen kaldır
    const organizationCells = thead.querySelectorAll('.organization-cell');
    const cellsToRemove = Array.from(organizationCells);
    
    // Sütunları sondan başa doğru kaldır (indeks karışıklığını önlemek için)
    cellsToRemove.reverse().forEach((th) => {
        const colIndex = Array.from(thead.children).indexOf(th);
        
        // Header'dan sütunu kaldır
        if (th.parentNode) {
            th.parentNode.removeChild(th);
        }
        
        // Tbody satırlarından da ilgili sütunu kaldır
        const tbodyRows = tbody.querySelectorAll('tr');
        tbodyRows.forEach(row => {
            const cell = row.children[colIndex];
            if (cell && cell.parentNode) {
                cell.parentNode.removeChild(cell);
            }
        });
    });
    
    console.log(`✅ ${cellsToRemove.length} organizasyon sütunu kaldırıldı`);
    
    // En az 5sütun kalmasını sağla (Ad Soyad, İdeal Kapasite, Mevcut Kapasite, Organizasyon Ekle)
    while (thead.children.length < 5) {
        addColumn();
    }
}
// burası organizasyonları tabloya yerleştirmesini yapıyor sutün sutün 
function createOrganizationInColumn(organizationName, columnPosition) {
    console.log(`🔄 Organizasyon "${organizationName}" sütun ${columnPosition}'e yerleştiriliyor...`);
    
    const table = document.querySelector('.excel-table');
    if (!table) {
        console.error('❌ Tablo bulunamadı!');
        return;
    }
    
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    if (!thead || !tbody) {
        console.error('❌ Tablo başlığı veya gövdesi bulunamadı!');
        return;
    }
    
    if (columnPosition >= thead.children.length) {
        console.error(`❌ Sütun pozisyonu ${columnPosition} mevcut sütun sayısından büyük!`);
        return;
    }
    
    const targetTh = thead.children[columnPosition];
    if (!targetTh) {
        console.error(`❌ Sütun ${columnPosition} bulunamadı!`);
        return;
    }
    
    const text = organizationName;
    const lines = text.split('\n');
    const minHeight = 10;
    const minWidth = 5;
    const heightPerChar = 12;
    const widthPerLine = 15;
    
    const totalChars = text.length;
    const calculatedHeight = Math.max(minHeight, totalChars * heightPerChar);
    const calculatedWidth = Math.max(minWidth, Math.min(100, lines.length * widthPerLine));
    
    targetTh.classList.remove('empty-cell');
    targetTh.classList.add('organization-cell');
    targetTh.innerHTML = `<button class="organization-button" onclick="editOrganization(this)">${text}</button>`;

    // Tüm satırlara resim ekleme kısmı kaldırıldı
    // Sadece Ad Soyad satırını buluyoruz ama içine resim eklemiyoruz
    const tbodyRows = tbody.querySelectorAll('tr');
    for (let i = 0; i < tbodyRows.length; i++) {
        const row = tbodyRows[i];
        const firstCell = row.cells[4];

        if (firstCell && firstCell.textContent.trim() === 'Ad Soyad') {
            // Ad Soyad satırından sonraki satırlara artık resim eklenmiyor, döngüyü kırıyoruz
            break;
        }
    }
    
    // İdeal ve Mevcut Kurumsal Kapasitesi satırlarına input ekle
    const idealRow = Array.from(tbodyRows).find(row => row.cells[1].textContent.trim() === 'İdeal Kurumsal Kapasitesi');
    if (idealRow && idealRow.cells[columnPosition]) {
        idealRow.cells[columnPosition].innerHTML = `
            <input class="capacity-input" type="number" placeholder="0" min="0" max="100"
                   style="width: 100%; height: 40px; border: 2px solid rgb(52, 152, 219);
                          border-radius: 6px; background: rgb(255, 255, 255);
                          text-align: center; font-size: 0.9rem; font-weight: 500;
                          color: rgb(73, 80, 87); cursor: pointer; transition: 0.2s;
                          box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
        `;
    }
    
    const mevcutRow = Array.from(tbodyRows).find(row => row.cells[1].textContent.trim() === 'Mevcut Kurumsal Kapasitesi');
    if (mevcutRow && mevcutRow.cells[columnPosition]) {
        mevcutRow.cells[columnPosition].innerHTML = `
            <input class="capacity-input" type="number" placeholder="0" min="0" max="100" disabled
                   style="width: 100%; height: 40px; border: 2px solid rgb(52, 152, 219);
                          border-radius: 6px; background: rgb(255, 255, 255);
                          text-align: center; font-size: 0.9rem; font-weight: 500;
                          color: rgb(73, 80, 87); cursor: pointer; transition: 0.2s;
                          box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
        `;
    }
    
    // Ad Soyad satırına gradient uygula
  const adSoyadRow = Array.from(tbodyRows).find(row => row.cells[4].textContent.trim() === 'Ad Soyad');

if (adSoyadRow && adSoyadRow.cells[columnPosition]) {
    // Organizasyon sütunundaki hücreye gradient uygula
    adSoyadRow.cells[columnPosition].style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    adSoyadRow.cells[columnPosition].style.color = 'white';
}

   
    console.log(`✅ Organizasyon "${organizationName}" sütun ${columnPosition}'e yerleştirildi`);
}


// "Organizasyon Ekle" butonunu en sağa taşı
function moveAddOrganizationButtonToRightmost() {
    const table = document.querySelector('.excel-table');
    if (!table) return;

    const headerRow = table.querySelector('thead tr');  // sadece başlık satırı
    if (!headerRow) return;

    // 1. satırdaki tüm .rotated-header elemanlarını al
    const buttons = headerRow.querySelectorAll('.rotated-header');

    let orgEkleButton = null;

    buttons.forEach(button => {
        if (button.textContent.trim() === 'Organizasyon Ekle') {
            orgEkleButton = button;
        }
    });

    if (!orgEkleButton) {
        console.log('⚠️ Organizasyon Ekle butonu bulunamadı. Yeni buton oluşturuluyor.');

        // Yeni th oluştur
        const newTh = document.createElement('th');

        // Yeni div oluştur
        const newDiv = document.createElement('div');
        newDiv.className = 'rotated-header';
        newDiv.textContent = 'Organizasyon Ekle';
        newDiv.setAttribute('onclick', 'moveOrganizationHeader(this)');

        // div'i th içine ekle
        newTh.appendChild(newDiv);

        // th'yi son sütun olarak ekle
        headerRow.appendChild(newTh);

        console.log('✅ Yeni Organizasyon Ekle butonu oluşturuldu ve sona eklendi.');
        return;
    }

    const currentTh = orgEkleButton.parentElement;  // butonun içinde olduğu th
    const lastTh = headerRow.lastElementChild;

    if (currentTh !== lastTh) {
        // Butonu başlık satırında en sona taşı
        headerRow.appendChild(currentTh);
        console.log('✅ Organizasyon Ekle butonu başlık satırında en sağa taşındı.');
    } else {
        console.log('✅ Organizasyon Ekle butonu zaten en sağda.');
    }
}




// Veritabanından gelen organizasyonu tabloya ekleme fonksiyonu
function createOrganizationFromDatabase(organizationName) {
    console.log('🔄 Organizasyon tabloya ekleniyor:', organizationName);
    
    const table = document.querySelector('.excel-table');
    if (!table) {
        console.error('❌ Tablo bulunamadı!');
        return;
    }

    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Yeni sütun ekle
    console.log('📏 Yeni sütun ekleniyor...');
    addColumn();
    
    // Son eklenen sütunu bul
    const lastTh = thead.lastElementChild;
    const colIndex = Array.from(thead.children).indexOf(lastTh);
    console.log('📍 Sütun indeksi:', colIndex);
    
    // Organizasyon adını başlığa ekle
    const text = organizationName;
const lines = text.split('\n');
const minHeight = 100;
const minWidth = 168;

const maxWidth = 138;      // küçültüldü

const totalChars = text.length;
const calculatedHeight = Math.max(minHeight, totalChars * heightPerChar);
const calculatedWidth = Math.max(minWidth, Math.min(maxWidth, lines.length * widthPerLine));

lastTh.classList.remove('empty-cell');
lastTh.classList.add('organization-cell');

lastTh.innerHTML = `<button class="organization-button" onclick="editOrganization(this)" style="height: ${calculatedHeight}px; width: ${calculatedWidth}px;">${text}</button>`;
console.log('✅ Organizasyon butonu oluşturuldu:', text);

    
    // Tüm satırlara resim ekle (sadece Ad Soyad satırından sonraki satırlara)
    console.log('✅ Organizasyon butonu oluşturuldu:', text);


const tbodyRows = tbody.querySelectorAll('tr');
for (let i = 0; i < tbodyRows.length; i++) {
    const row = tbodyRows[i];
    const firstCell = row.cells[4];
    
    // "Ad Soyad" satırını bul ve sonrasındaki satırlara resim ekle
    if (firstCell && firstCell.textContent.trim() === 'Ad Soyad') {
        for (let j = i + 1; j < tbodyRows.length; j++) {
            const currentRow = tbodyRows[j];
            // 8. sütundan itibaren (indeks 7'den başla)
            for (let colIndex = 7; colIndex < currentRow.cells.length; colIndex++) {
                const cell = currentRow.cells[colIndex];
                if (cell && !cell.querySelector('img')) {  // Hücrede resim yoksa ekle
                    const button = document.createElement('button');
                    button.style.border = 'none';
                    button.style.background = 'transparent';
                    button.style.padding = '0';
                    button.style.cursor = 'pointer';

                    const img = document.createElement('img');
                    img.src = 'pie (2).png';
                    img.alt = 'Resim';
                    img.style.width = '60px';
                    img.style.height = '60px';

                    button.appendChild(img);

                    button.addEventListener('click', () => {
                        // Pie chart tipine göre modal aç (dinamik kontrol)
                        const currentSrc = img.src;
                        console.log('Pie chart tıklandı:', currentSrc);
                        
                        if (currentSrc.includes('pie (3).png')) {
                            // Çoklu beceri formu aç
                            console.log('Çoklu beceri formu açılıyor...');
                            const organizationId = cell.getAttribute('data-organization-id');
                            const row = cell.closest('tr');
                            if (row && organizationId) {
                                const personNameCell = row.cells[4];
                                const personName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
                                getPersonIdFromRow(row).then(personId => {
                                    openMultiSkillModal(organizationId, personName, personId, cell);
                                });
                            } else {
                                console.log('Organizasyon ID veya satır bulunamadı');
                            }
                        } else {
                            // Pie (3).png değilse temel beceri formu aç
                            const decodedSrc = decodeURIComponent(currentSrc);
                            const isPie3 = decodedSrc.includes('pie (3).png') || currentSrc.includes('pie%20(3).png');
                            if (!isPie3) {
                                console.log('Temel beceri formu açılıyor...');
                                openTemelBecerilerModal(img);
                            } else {
                                console.log('Pie (3).png için çoklu beceri formu zaten açıldı');
                            }
                        }
                    });
                    
                    // Pie chart'ı organizasyon durumuna göre güncelle
                    updatePieChartForOrganization(img, cell);

                    cell.appendChild(button);
                }
            }
        }
        break;  // "Ad Soyad" satırı bulunduktan sonra döngüyü bitir
    }
}

    
    // İdeal ve Mevcut Kurumsal Kapasitesi satırlarına input ekle
    const idealRow = tbodyRows.find(row => row.cells[0].textContent.trim() === 'İdeal Kurumsal Kapasitesi');
    if (idealRow && idealRow.cells[colIndex]) {
        idealRow.cells[colIndex].innerHTML = `
            <input class="capacity-input" type="number" placeholder="0" min="0" max="100"
                   style="width: 100%; height: 40px; border: 2px solid rgb(52, 152, 219);
                          border-radius: 6px; background: rgb(255, 255, 255);
                          text-align: center; font-size: 0.9rem; font-weight: 500;
                          color: rgb(73, 80, 87); cursor: pointer; transition: 0.2s;
                          box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
        `;
    }
    
    const mevcutRow = tbodyRows.find(row => row.cells[0].textContent.trim() === 'Mevcut Kurumsal Kapasitesi');
    if (mevcutRow && mevcutRow.cells[colIndex]) {
        mevcutRow.cells[colIndex].innerHTML = `
            <input class="capacity-input" type="number" placeholder="0" min="0" max="100" disabled
                   style="width: 100%; height: 40px; border: 2px solid rgb(52, 152, 219);
                          border-radius: 6px; background: rgb(255, 255, 255);
                          text-align: center; font-size: 0.9rem; font-weight: 500;
                          color: rgb(73, 80, 87); cursor: pointer; transition: 0.2s;
                          box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
        `;
    }
    
    console.log('✅ Organizasyon tamamen eklendi:', organizationName);
}

// Kişileri veritabanından yükleme fonksiyonu
function loadPersons() {
    console.log('Kişiler veritabanından yükleniyor...');
    
    fetch('api/get_persons.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('📋 Veritabanından gelen kişiler:', data.persons);
                
                // Veritabanından gelen kişileri tabloya ekle
                if (data.persons && data.persons.length > 0) {
                    data.persons.forEach(person => {
                        createPersonFromDatabase(person.name);
                    });
                }
                
                // Her durumda en sona boş satır ekle (yeni kullanıcı eklemek için)
                addEmptyNameRow();
                addRowNumbersBelowHeader('.excel-table', 'Sıra');
                
                // Mevcut kişi satırlarına tıklama özelliği ekle
                setTimeout(() => {
                    addClickToExistingPersons();
                }, 100);
            } else {
                console.error('❌ Kişi yükleme hatası:', data.message);
                // Hata durumunda boş satır ekle
                addEmptyNameRow();
                addRowNumbersBelowHeader('.excel-table', 'Sıra');
            }
        })
        .catch(error => {
            console.error('❌ Kişi yükleme hatası:', error);
            // Hata durumunda boş satır ekle
            addEmptyNameRow();
            addRowNumbersBelowHeader('.excel-table', 'Sıra');
        });
        
        
}

function addEmptyNameRow() {
    const table = document.querySelector('.excel-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const theadRow = table.querySelector('thead tr');
    if (!theadRow) {
        console.error('❌ <thead> satırı bulunamadı!');
        return;
    }

    const headerCells = theadRow.querySelectorAll('th');
    const totalColumns = headerCells.length;

    // Organizasyon sütunlarının başlangıcını bulalım:
    // Önce organizasyon sütunları hangi sütunlardır?
    // Senin loadOrganizations fonksiyonunda organizasyonlar 5. sütundan başlayarak yerleştiriliyor.
    // Yani Ad Soyad (4 sütun var) -> 0,1,2,3,4 - burada genelde 4 veya 5 olabilir
    // Ancak tablo başlıklarında 5. indexi bulalım (başlıkta organizasyon isimleri var)
    // Organizasyon sütunları headerCells içinde 5 ve sonrası (yani index 5'ten itibaren)
    const orgStartIndex = 5;

    const newRow = document.createElement('tr');

    // 1- İlk 4 boş hücre ekle (index 0-3)
    for (let i = 0; i < 4; i++) {
        const emptyCell = document.createElement('td');
        emptyCell.className = 'empty-cell';
        newRow.appendChild(emptyCell);
    }

    // 2- 5. hücre olarak tıklanabilir hücre ekle (index 4)
    const headerCell = document.createElement('td');
    headerCell.className = 'row-header';
    headerCell.style.position = 'relative';
    headerCell.onclick = function() { addNameRow(this); };
    newRow.appendChild(headerCell);

    // 3- Kalan hücreleri ekle (totalColumns - 5 kadar)
    const remainingCells = totalColumns - 5;

    for (let i = 0; i < remainingCells; i++) {
        const cell = document.createElement('td');

        // 6. ve 7. sütunlar için input ekle (burada i=0 -> 5.sütun, i=1 -> 6.sütun)
        // Yani tabloda toplamda 5 ve 6 indexli hücreler input olacak
        if (i === 0 || i === 1) {
            cell.innerHTML = `
                <input class="capacity-input" type="number" placeholder="0" min="0" max="100"
                       style="width: 100%; height: 40px; border: 2px solid rgb(52, 152, 219);
                              border-radius: 6px; background: rgb(255, 255, 255);
                              text-align: center; font-size: 0.9rem; font-weight: 500;
                              color: rgb(73, 80, 87); cursor: pointer; transition: 0.2s;
                              box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
            `;
        } else {
            cell.className = 'empty-cell';

            // Eğer hücre organizasyon sütunu ise (başlık indeksine göre)
            const cellIndexInRow = i + 5; // Toplam tablo indeksi

            if (cellIndexInRow >= orgStartIndex) {
    // Hücrede zaten img var mı diye kontrol et
    if (!cell.querySelector('img')) {
        // Pie butonu ekle
        const button = document.createElement('button');
        button.style.border = 'none';
        button.style.background = 'transparent';
        button.style.padding = '0';
        button.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = 'pie (2).png';
        img.alt = 'Resim';
        img.style.width = '60px';
        img.style.height = '60px';

        button.appendChild(img);

        button.addEventListener('click', () => {
            // Pie chart tipine göre modal aç (dinamik kontrol)
            const currentSrc = img.src;
            console.log('Pie chart tıklandı:', currentSrc);
            
            if (currentSrc.includes('pie (3).png')) {
                // Çoklu beceri formu aç
                console.log('Çoklu beceri formu açılıyor...');
                const organizationId = cell.getAttribute('data-organization-id');
                const row = cell.closest('tr');
                if (row && organizationId) {
                    const personNameCell = row.cells[4];
                    const personName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
                    getPersonIdFromRow(row).then(personId => {
                        openMultiSkillModal(organizationId, personName, personId, cell);
                    });
                } else {
                    console.log('Organizasyon ID veya satır bulunamadı');
                }
            } else {
                // Pie (3).png değilse temel beceri formu aç
                const decodedSrc = decodeURIComponent(currentSrc);
                const isPie3 = decodedSrc.includes('pie (3).png') || currentSrc.includes('pie%20(3).png');
                if (!isPie3) {
                    console.log('Temel beceri formu açılıyor...');
                    openTemelBecerilerModal(img);
                } else {
                    console.log('Pie (3).png için çoklu beceri formu zaten açıldı');
                }
            }
        });
        
        // Pie chart'ı organizasyon durumuna göre güncelle
        updatePieChartForOrganization(img, cell);

        cell.appendChild(button);
        }
        }

        }

        newRow.appendChild(cell);
    }

    tbody.appendChild(newRow);
    console.log('✅ Boş isim satırı eklendi');
}


// Mevcut kişi satırlarına tıklama özelliği ekle
function addClickToExistingPersons() {
    console.log('🔍 Mevcut kişi satırlarına tıklama özelliği ekleniyor...');
    
    const table = document.querySelector('.excel-table');
    if (!table) {
        console.error('❌ Tablo bulunamadı');
        return;
    }
    
    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('❌ Tbody bulunamadı');
        return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    console.log(`🔍 Toplam ${rows.length} satır bulundu`);
    
    rows.forEach((row, index) => {
        // 5. sütundaki hücreyi kontrol et (Ad Soyad sütunu)
        const nameCell = row.children[4]; // index 4 = 5. sütun
        
        if (nameCell && nameCell.classList.contains('row-header')) {
            const personName = nameCell.textContent.trim();
            console.log(`🔍 Satır ${index}: "${personName}"`);
            
            // Eğer hücrede isim varsa ve "Ad Soyad" değilse tıklama özelliği ekle
            if (personName && personName !== '' && personName !== 'Ad Soyad') {
                console.log(`✅ "${personName}" için tıklama özelliği ekleniyor...`);
                
                // Mevcut onclick'i kaldır
                nameCell.onclick = null;
                
                // Yeni tıklama özelliği ekle
                nameCell.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    editPersonName(nameCell, personName);
                });
                
                nameCell.style.cursor = 'pointer';
                nameCell.title = 'İsmi düzenlemek için tıklayın';
                
                console.log(`✅ "${personName}" için tıklama özelliği eklendi`);
            }
        }
    });
    
    console.log('✅ Tıklama özellikleri ekleme işlemi tamamlandı');
}

// Sayfa yüklendikten sonra tıklama özelliklerini ekle
window.addEventListener('load', function() {
    console.log('🔄 Sayfa yüklendi, tıklama özellikleri ekleniyor...');
    setTimeout(() => {
        addClickToExistingPersons();
    }, 500);
});

// Test fonksiyonu - konsoldan çağrılabilir
window.addClickToPersons = addClickToExistingPersons;

// Kişi ismini düzenleme fonksiyonu
function editPersonName(cellElement, currentName) {
    // Eğer zaten düzenleme modundaysa çık
    if (cellElement.querySelector('input')) {
        return;
    }
    
    // Mevcut içeriği sakla
    const originalContent = cellElement.textContent;
    
    // Input oluştur
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.cssText = `
        width: 100%;
        padding: 4px 8px;
        border: 2px solid #007bff;
        border-radius: 4px;
        font-size: 14px;
        background: white;
        outline: none;
    `;
    
    // Hücreyi temizle ve input ekle
    cellElement.innerHTML = '';
    cellElement.appendChild(input);
    input.focus();
    input.select();
    
    // Enter tuşu ile kaydet
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            savePersonNameChange(cellElement, input.value.trim(), currentName);
        } else if (e.key === 'Escape') {
            // Escape ile iptal
            cellElement.textContent = originalContent;
            cellElement.onclick = function () { 
                editPersonName(cellElement, originalContent); 
            };
            cellElement.style.cursor = 'pointer';
            cellElement.title = 'İsmi düzenlemek için tıklayın';
        }
    });
    
    // Input'tan çıkınca kaydet
    input.addEventListener('blur', function() {
        savePersonNameChange(cellElement, input.value.trim(), currentName);
    });
}

// Kişi ismi değişikliğini kaydet
function savePersonNameChange(cellElement, newName, oldName) {
    if (!newName || newName.trim() === '') {
        // Boş isim girilirse eski ismi geri yükle
        cellElement.textContent = oldName;
        cellElement.onclick = function () { 
            editPersonName(cellElement, oldName); 
        };
        cellElement.style.cursor = 'pointer';
        cellElement.title = 'İsmi düzenlemek için tıklayın';
        showSuccessNotification('İsim boş olamaz', 'warning');
        return;
    }
    
    if (newName === oldName) {
        // İsim değişmemişse sadece görünümü geri yükle
        cellElement.textContent = newName;
        cellElement.onclick = function () { 
            editPersonName(cellElement, newName); 
        };
        cellElement.style.cursor = 'pointer';
        cellElement.title = 'İsmi düzenlemek için tıklayın';
        return;
    }
    
    // Loading göster
    cellElement.innerHTML = '<span style="color: #666;">Kaydediliyor...</span>';
    
    // API çağrısı
    fetch('api/update_person_name.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            old_name: oldName,
            new_name: newName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Başarılı güncelleme
            cellElement.textContent = newName;
            cellElement.onclick = function () { 
                editPersonName(cellElement, newName); 
            };
            cellElement.style.cursor = 'pointer';
            cellElement.title = 'İsmi düzenlemek için tıklayın';
            showSuccessNotification(`"${oldName}" → "${newName}" olarak güncellendi`);
        } else {
            // Hata durumu - eski ismi geri yükle
            cellElement.textContent = oldName;
            cellElement.onclick = function () { 
                editPersonName(cellElement, oldName); 
            };
            cellElement.style.cursor = 'pointer';
            cellElement.title = 'İsmi düzenlemek için tıklayın';
            showSuccessNotification('İsim güncellenirken hata oluştu: ' + data.message, 'error');
        }
    })
    .catch(error => {
        // Hata durumu - eski ismi geri yükle
        cellElement.textContent = oldName;
        cellElement.onclick = function () { 
            editPersonName(cellElement, oldName); 
        };
        cellElement.style.cursor = 'pointer';
        cellElement.title = 'İsmi düzenlemek için tıklayın';
        console.error('❌ İsim güncelleme hatası:', error);
        showSuccessNotification('İsim güncellenirken hata oluştu', 'error');
    });
}




// Veritabanından gelen kişiyi tabloya ekleme fonksiyonu
function createPersonFromDatabase(personName) {
    const table = document.querySelector('.excel-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');

    // Yeni satır oluştur
    const newRow = document.createElement('tr');

    // İlk 4 hücreyi boş olarak ekle (index 0-3)
    for (let i = 0; i < 4; i++) {
        const emptyCell = document.createElement('td');
        emptyCell.className = 'empty-cell';
        newRow.appendChild(emptyCell);
    }

    // 5. hücre: isim
    const headerCell = document.createElement('td');
    headerCell.className = 'row-header';
    headerCell.textContent = personName;
    headerCell.onclick = function () { 
        editPersonName(headerCell, personName); 
    };
    headerCell.style.cursor = 'pointer';
    headerCell.title = 'İsmi düzenlemek için tıklayın';
    newRow.appendChild(headerCell);
    
    // Diğer hücreleri ekle (ilk satırdaki sütun sayısına göre)
    const firstRow = tbody.querySelector('tr');
   if (firstRow) {
    //ilk satırdaki sutün sayısını alıp 2 çıkartıyor ki ad soyad sutünundan sonra kaç adet organizasyon olduğunnu hesaplamak için
    const columnCount = firstRow.children.length - 2;
    for (let i = 0; i < columnCount; i++) {
        const cell = document.createElement('td');

        if (i === 0 || i === 1) {
                // Kapasite input'u ekle
                cell.innerHTML = `
                    <input class="capacity-input" type="number" placeholder="0" min="0" max="100"
                           style="width: 100%; height: 40px; border: 2px solid rgb(52, 152, 219);
                                  border-radius: 6px; background: rgb(255, 255, 255);
                                  text-align: center; font-size: 0.9rem; font-weight: 500;
                                  color: rgb(73, 80, 87); cursor: pointer; transition: 0.2s;
                                  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;">
                `;
            } else {
                // Diğer hücreler boş bırakılacak
                cell.className = 'empty-cell';
            }
            newRow.appendChild(cell);
            
        }
    }

    tbody.appendChild(newRow);
       fetchAndFillPersonDetailsByName(personName);

    // Satır numaralarını güncelleyen fonksiyonu çağır
    addRowNumbersBelowHeader('.excel-table', 'Sıra');
    
}




// veri tabanından kişinin Şirket Unvan Sicil no gibi şeylerini çağırma kodu
function fetchAndFillPersonDetailsByName(personName) {
    const table = document.querySelector('.excel-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const nameColumnIndex = 4; // 5. sütun
    const companyNameColumnIndex = 1; // 2. sütun
    const titleColumnIndex = 2; // 3. sütun
    const registrationNoColumnIndex = 3; // 4. sütun

    const rows = tbody.querySelectorAll('tr');

    // İlgili satırı bul
    let targetRow = null;
    for (let row of rows) {
        const nameCell = row.children[nameColumnIndex];
        if (nameCell && nameCell.textContent.trim() === personName) {
            targetRow = row;
            break;
        }
    }

    if (!targetRow) {
        console.warn('Kişi bulunamadı:', personName);
        return;
    }

    // API çağrısı (tek kişi için)
    const url = `api/get_person_details.php?names=${encodeURIComponent(personName)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Veri alma hatası:', data.message);
                return;
            }

            // API döndüğü varsayılan persons dizisi (tek kişilik de olabilir)
            const persons = data.persons;
            if (!persons || persons.length === 0) {
                console.warn('Veri bulunamadı:', personName);
                return;
            }

            const personData = persons.find(p => p.name === personName);
            if (!personData) {
                console.warn('Kişi verisi bulunamadı:', personName);
                return;
            }

            // Satırdaki hücreleri güncelle
            if (targetRow.children[companyNameColumnIndex]) {
                targetRow.children[companyNameColumnIndex].textContent = personData.company_name || '';
            }
            if (targetRow.children[titleColumnIndex]) {
                targetRow.children[titleColumnIndex].textContent = personData.title || '';
            }
            if (targetRow.children[registrationNoColumnIndex]) {
                targetRow.children[registrationNoColumnIndex].textContent = personData.registration_no || '';
            }
        })
        .catch(err => {
            console.error('Fetch hatası:', err);
        });
}


// UI fonksiyonları
const hamburgerMenu = document.getElementById('hamburgerMenu');
const mobileMenu = document.getElementById('mobileMenu');

hamburgerMenu.addEventListener('click', () => {
    mobileMenu.classList.add('open');  // burası önemli!
});

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
}

function goToPerson(){
    window.location.href = "person.html"; // istediğin URL
}


function addNewSubject() {
    window.location.href="hakkımızda.html";
}

function goToSettings() {
    alert('Ayarlar fonksiyonu çalıştı');
}

function logout() {
    // Çıkış fonksiyonu (Şimdilik devre dışı)
    console.log('Çıkış yapılıyor... (simülasyon)');
    // Şimdilik sadece console'a yazdır
    alert('Çıkış yapıldı (simülasyon)');
}

function addCustomSubject() {
    const customInput = document.getElementById('customSubjectInput');
    const subjectSelect = document.getElementById('editEventSubject');
    const addButton = document.getElementById('addCustomSubjectBtn');
    
    if (!customInput || !subjectSelect || !addButton) {
        console.error('❌ Ders seçim elementleri bulunamadı!');
        return;
    }
    
    const customSubject = customInput.value.trim();
    
    if (!customSubject) {
        alert('Lütfen bir ders adı girin!');
        customInput.focus();
        return;
    }
    
    // Yeni dersi select'e ekle
    const option = document.createElement('option');
    option.value = customSubject;
    option.textContent = customSubject;
    subjectSelect.appendChild(option);
    
    // Select'i göster ve yeni dersi seç
    subjectSelect.style.display = 'block';
    subjectSelect.value = customSubject;
    
    // Özel giriş alanını gizle
    customInput.style.display = 'none';
    addButton.style.display = 'none';
    
    
    
    // Başarı mesajı göster
    showSuccessNotification(`"${customSubject}" dersi başarıyla eklendi!`);
}

function showSuccessNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    
    // Bildirim tipine göre renk belirle
    let backgroundColor = '#28a745'; // Success (yeşil)
    if (type === 'error') {
        backgroundColor = '#dc3545'; // Error (kırmızı)
    } else if (type === 'warning') {
        backgroundColor = '#ffc107'; // Warning (sarı)
    } else if (type === 'info') {
        backgroundColor = '#17a2b8'; // Info (mavi)
    }
    
    notification.style.cssText = `
        background: ${backgroundColor};
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        margin-bottom: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}


// Sayfa yüklendiğinde kaydedilen verileri yükle
document.addEventListener('DOMContentLoaded', function() {
    loadPersons();
    setTimeout(() => {
    loadOrganizations();
    }, 1);
    
    

    
    
});


// Organizasyon pozisyonlarını veritabanında güncelle
function updateOrganizationPositions(reorganizedOrganizations) {
    
    
    // Her organizasyon için pozisyon güncellemesi yap
    const updatePromises = reorganizedOrganizations.map(org => {
        console.log(`🔍 Organizasyon verisi:`, org);
        console.log(`🔍 org.name:`, org.name, typeof org.name);
        console.log(`🔍 org.new_column_position:`, org.new_column_position, typeof org.new_column_position);
        
        const requestData = {
            organization_name: org.name,
            new_position: org.new_column_position
        };
        console.log(`📤 ${org.name} için gönderilen veri:`, requestData);
        
        return fetch('api/update_organization_position.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Organizasyon ${org.name} pozisyonu güncellendi: ${org.column_position} → ${org.new_column_position}`);
                return true;
            } else {
                console.error(`❌ Organizasyon ${org.name} pozisyonu güncellenemedi:`, data.message);
                if (data.debug) {
                    console.error('🔍 Debug bilgileri:', data.debug);
                }
                return false;
            }
        })
        .catch(error => {
            console.error(`❌ Organizasyon ${org.name} pozisyon güncelleme hatası:`, error);
            return false;
        });
    });
    
    // Tüm güncellemelerin tamamlanmasını bekle
    Promise.all(updatePromises)
        .then(results => {
            const successCount = results.filter(result => result).length;
            console.log(`✅ ${successCount}/${reorganizedOrganizations.length} organizasyon pozisyonu güncellendi`);
        });
}

// =====================================================
// KİŞİ ARAMA FONKSİYONLARI
// =====================================================

// Arama input'u için event listener'ları
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('personSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput) {
        // Arama input'u için event listener
        searchInput.addEventListener('input', debounce(handlePersonSearch, 300));
        searchInput.addEventListener('focus', showSearchResults);
        searchInput.addEventListener('blur', hideSearchResults);
        
        // Temizle butonu için event listener
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
        }
        
        // Dışarı tıklama ile sonuçları gizle
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                hideSearchResults();
            }
        });
    }
});

// Debounce fonksiyonu - performans için
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Kişi arama fonksiyonu
async function handlePersonSearch() {
    const searchInput = document.getElementById('personSearchInput');
    const searchResults = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length < 2) {
        hideSearchResults();
        clearSearchBtn.style.display = 'none';
        return;
    }
    
    clearSearchBtn.style.display = 'block';
    
    try {
        console.log('🔍 Kişi aranıyor:', searchTerm);
        
        const response = await fetch('api/get_persons.php');
        const data = await response.json();
        
        if (data.success) {
            const filteredPersons = data.persons.filter(person => 
                person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (person.position && person.position.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            
            displaySearchResults(filteredPersons);
        } else {
            console.error('❌ Kişi listesi alınamadı:', data.message);
            showNoResults();
        }
    } catch (error) {
        console.error('❌ Arama hatası:', error);
        showNoResults();
    }
}

// Arama sonuçlarını göster
function displaySearchResults(persons) {
    const searchResults = document.getElementById('searchResults');
    
    if (persons.length === 0) {
        showNoResults();
        return;
    }
    
    let html = '';
    
    persons.forEach(person => {
        const initials = getInitials(person.name);
        const email = person.email || 'E-posta yok';
        const position = person.position || 'Pozisyon belirtilmemiş';
        
        html += `
            <div class="search-result-item" onclick="selectPerson('${person.name}')">
                <div class="person-avatar">${initials}</div>
                <div class="person-info">
                    <div class="person-name">${person.name}</div>
                    <div class="person-email">${email}</div>
                    <div class="person-position">${position}</div>
                </div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

// Kişi seçme fonksiyonu
function selectPerson(personName) {
    const searchInput = document.getElementById('personSearchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.value = personName;
    hideSearchResults();
    
    // Seçilen kişiyi vurgula (opsiyonel)
    highlightPersonInTable(personName);
    
    console.log('✅ Kişi seçildi:', personName);
}

// Kişi baş harflerini al
function getInitials(name) {
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Arama sonuçlarını göster
function showSearchResults() {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('personSearchInput');
    
    if (searchInput.value.trim().length >= 2) {
        searchResults.style.display = 'block';
    }
}

// Arama sonuçlarını gizle
function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.style.display = 'none';
}

// Sonuç bulunamadı mesajı
function showNoResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<div class="no-results">Kişi bulunamadı</div>';
    searchResults.style.display = 'block';
}

// Arama temizle
function clearSearch() {
    const searchInput = document.getElementById('personSearchInput');
    const searchResults = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    searchInput.value = '';
    hideSearchResults();
    clearSearchBtn.style.display = 'none';
    
    // Vurgulamayı kaldır
    removePersonHighlight();
}

// Kişiyi tabloda vurgula (opsiyonel)
function highlightPersonInTable(personName) {
    // Tablodaki kişi satırlarını bul ve vurgula
    const rows = document.querySelectorAll('.excel-table tbody tr');
    
    rows.forEach(row => {
        const nameCell = row.querySelector('td:first-child');
        if (nameCell && nameCell.textContent.trim() === personName) {
            row.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            row.style.borderLeft = '4px solid #667eea';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Kişi vurgulamasını kaldır
function removePersonHighlight() {
    const rows = document.querySelectorAll('.excel-table tbody tr');
    
    rows.forEach(row => {
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
    });
}
// TEMEL BECERİLER FORMU
 // Temel Beceriler Modal Fonksiyonları
    // Pie chart'ı organizasyon durumuna göre güncelle (Global fonksiyon)
    window.updatePieChartForOrganization = async function(imgElement, cell) {
        try {
            // Resmin bulunduğu hücreden organizasyon bilgisini al
            const row = cell.parentElement;
            const table = row.closest('table');
            if (!table) return;
            
            // Gerçek sütun indeksini hesapla
            const colIndex = getActualColumnIndex(cell);
            const adjustedColIndex = colIndex - 3;
            
            // Organizasyon verisini al
            fetch('api/get_organizations.php')
                .then(response => response.json())
                .then(data => {
                    if (!data.success) return;
                    
                    // Sütun pozisyonuna göre organizasyonu bul
                    let organization = data.organizations.find(org => parseInt(org.column_position) === adjustedColIndex);
                    
                    if (!organization) {
                        // Organizasyon adına göre bulmayı dene
                        const thead = table.querySelector('thead');
                        if (thead) {
                            const headerRow = thead.querySelector('tr');
                            if (headerRow) {
                                let headerText = null;
                                let realHeaderIndex = 0;
                                for (const th of headerRow.children) {
                                    const colspan = th.getAttribute('colspan') ? parseInt(th.getAttribute('colspan')) : 1;
                                    if (realHeaderIndex <= colIndex && colIndex < realHeaderIndex + colspan) {
                                        headerText = th.textContent.trim();
                                        break;
                                    }
                                    realHeaderIndex += colspan;
                                }
                                
                                if (headerText) {
                                    organization = data.organizations.find(org => org.name === headerText);
                                }
                            }
                        }
                    }
                    
                    if (organization) {
                        // Önce veritabanından pie chart durumunu kontrol et
                        checkPieChartStatusFromDatabase(organization.id, row, imgElement);
                    }
                })
                .catch(error => {
                    console.error('Organizasyon bilgisi alınamadı:', error);
                });
        } catch (error) {
            console.error('Pie chart güncelleme hatası:', error);
        }
    };
    
    // Veritabanından pie chart durumunu kontrol et
    async function checkPieChartStatusFromDatabase(organizationId, row, imgElement) {
        // Person name'i doğru hücreden al (4. hücre - Ad Soyad sütunu)
        const personNameCell = row.cells[4]; // 4. hücre Ad Soyad sütunu
        const rowName = personNameCell ? personNameCell.textContent.trim() : 'unknown';
        
        // Person ID'yi al (eğer varsa)
        const personId = await getPersonIdFromRow(row);
        
        // Eğer person ID yoksa, person name'den al
        let finalPersonId = personId;
        if (!finalPersonId && rowName !== 'unknown') {
            finalPersonId = await findPersonIdByName(rowName);
        }
        
        fetch('api/get_pie_chart_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization_id: organizationId,
                row_name: rowName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Veritabanından gelen duruma göre pie chart'ı güncelle
                imgElement.src = data.image_name;
                console.log(`📊 Organizasyon ${organizationId}, Kişi "${rowName}": ${data.image_name}`);
                
                // Eğer veritabanında kayıt yoksa veya eskiyse, beceri durumunu kontrol et
                if (!data.updated_at || isStatusOutdated(data.updated_at)) {
                    console.log('Pie chart durumu güncel değil, beceri durumu kontrol ediliyor...');
                    checkOrganizationSkillsStatus(organizationId, rowName, imgElement, finalPersonId);
                }
            }
        })
        .catch(error => {
            console.error('Pie chart durumu alınamadı:', error);
            // Hata durumunda beceri durumunu kontrol et
            checkOrganizationSkillsStatus(organizationId, rowName, imgElement, finalPersonId);
        });
    }
    
    // Satırdan person ID'yi al
    async function getPersonIdFromRow(row) {
        // Satırda data-person-id attribute'u varsa onu kullan
        if (row.getAttribute('data-person-id')) {
            return row.getAttribute('data-person-id');
        }
        
        // Yoksa person name'den person ID'yi bulmaya çalış
        const personNameCell = row.cells[4]; // 4. hücre Ad Soyad sütunu
        if (personNameCell) {
            const personName = personNameCell.textContent.trim();
            // Bu kişinin ID'sini veritabanından bul
            return await findPersonIdByName(personName);
        }
        
        return null;
    }
    
    // Person name'den person ID'yi bul
    function findPersonIdByName(personName) {
        return new Promise((resolve) => {
            fetch('api/get_person_id.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: personName
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data.personId);
                } else {
                    console.log(`⚠️ Person ID bulunamadı: "${personName}"`);
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('Person ID alma hatası:', error);
                resolve(null);
            });
        });
    }
    
    // Durumun eski olup olmadığını kontrol et (5 dakikadan eskiyse güncelle)
    function isStatusOutdated(updatedAt) {
        const now = new Date();
        const updateTime = new Date(updatedAt);
        const diffMinutes = (now - updateTime) / (1000 * 60);
        return diffMinutes > 5; // 5 dakikadan eskiyse güncelle
    }
    
    // Organizasyon beceri durumunu kontrol et ve pie chart'ı güncelle
    function checkOrganizationSkillsStatus(organizationId, rowName, imgElement, personId = null) {
        const requestData = {
            organization_id: organizationId
        };
        
        // Eğer person ID varsa, kişi bazlı kontrol yap
        if (personId) {
            requestData.person_id = personId;
        }
        
        fetch('api/check_organization_skills_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Beceri durumuna göre pie chart durumunu belirle
                const pieChartStatus = (data.all_completed && data.total_skills > 0) ? 'completed' : 'pending';
                const imageName = pieChartStatus === 'completed' ? 'pie (3).png' : 'pie (2).png';
                
                // Pie chart'ı güncelle
                imgElement.src = imageName;
                
                if (data.check_type === 'person_specific') {
                    console.log(`✅ Kişi ${personId} - Organizasyon ${organizationId}: ${pieChartStatus} - ${imageName}`);
                } else {
                    console.log(`✅ Organizasyon ${organizationId}: ${pieChartStatus} - ${imageName}`);
                }
                
                // Durumu veritabanına kaydet
                updatePieChartStatusInDatabase(organizationId, rowName, pieChartStatus);
            }
        })
        .catch(error => {
            console.error('Beceri durumu kontrol hatası:', error);
        });
    }
    
    // Pie chart durumunu veritabanına kaydet
    function updatePieChartStatusInDatabase(organizationId, rowName, status) {
        fetch('api/update_pie_chart_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization_id: organizationId,
                row_name: rowName,
                pie_chart_status: status
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Pie chart durumu veritabanına kaydedildi: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Pie chart durumu kaydedilemedi:', error);
        });
    }
    
    
    // Çoklu beceri modal'ını aç
    function openMultiSkillModal(organizationId, personName, personId, clickedElement = null) {
        console.log(`🎯 Çoklu Beceri Modal açılıyor: Organizasyon ${organizationId}, Kişi ${personName}, Person ID: ${personId}`);
        console.log('🔍 Clicked Element:', clickedElement);
        
        // Organizasyon adını başlangıçta tanımla
        let organizationName = `Organizasyon ${organizationId}`;
        
        // Mevcut çoklu beceri modal'ını kullan
        const modal = document.getElementById('cokluBeceriModal');
        console.log('🔍 Modal Element:', modal);
        if (!modal) {
            console.error('❌ cokluBeceriModal elementi bulunamadı!');
            return;
        }
        
        // Eski modal içeriklerini gizle
        const oldContent = modal.querySelector('#cokluBeceriContent');
        const oldLoading = modal.querySelector('#cokluBeceriLoading');
        const oldEmpty = modal.querySelector('#cokluBeceriEmpty');
        
        if (oldContent) oldContent.style.display = 'none';
        if (oldLoading) oldLoading.style.display = 'none';
        if (oldEmpty) oldEmpty.style.display = 'none';
        
        // Yeni form içeriğini göster
        const newContent = modal.querySelector('#cokluBeceriFormContent');
        if (newContent) {
            newContent.style.display = 'block';
            console.log('✅ Yeni form içeriği gösterildi');
        }
        
        // Organizasyon adını tıklanan sütundan al
        if (clickedElement) {
            const cell = clickedElement.closest('td');
            const row = cell.parentElement;
            const table = row.closest('table');
            const colIndex = Array.from(cell.parentElement.children).indexOf(cell);
            
            console.log('🔍 Tıklanan hücre sütun indexi:', colIndex);
            
            // Resimlerin bulunduğu sütunlar ile organizasyon başlıkları arasında 3 sütun farkı var
            // Resim sütunu 7 ise, organizasyon başlığı 4. sütunda (7-3=4)
            const organizationColIndex = colIndex - 3;
            console.log('🔍 Organizasyon sütun indexi (düzeltilmiş):', organizationColIndex);
            
            const thead = table.querySelector('thead');
            if (thead) {
                const headerRow = thead.querySelector('tr');
                if (headerRow && headerRow.children[organizationColIndex]) {
                    organizationName = headerRow.children[organizationColIndex].textContent.trim();
                    console.log('✅ Organizasyon adı sütundan alındı:', organizationName);
                    console.log('🔍 Sütun başlığı:', headerRow.children[organizationColIndex].textContent.trim());
                } else {
                    console.error('❌ Header row veya organizasyon sütunu bulunamadı');
                }
            } else {
                console.error('❌ Thead bulunamadı');
            }
        } else {
            console.error('❌ ClickedElement bulunamadı');
        }
        
        // Modal içeriğini güncelle
        updateCokluBeceriModalContent(organizationId, organizationName, personName);
        
        // Modal'ı hücrenin altına konumlandır
        if (clickedElement) {
            positionCokluBeceriModalBelowCell(modal, clickedElement);
        }
        
        // Modal'ı göster ve z-index'i artır
        modal.style.display = 'block';
        modal.style.zIndex = '99999';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        
        console.log('✅ Çoklu Beceri Modal gösterildi!');
        
        // Modal'ı zorla görünür yap - CSS animasyonunu override et
        modal.style.setProperty('visibility', 'visible', 'important');
        modal.style.setProperty('opacity', '1', 'important');
        modal.style.setProperty('pointer-events', 'auto', 'important');
        modal.style.setProperty('display', 'block', 'important');
        
        // Modal boyutlarını zorla ayarla
        modal.style.setProperty('width', '500px', 'important');
        modal.style.setProperty('height', 'auto', 'important');
        modal.style.setProperty('min-height', '300px', 'important');
        
        // Animasyonu durdur
        modal.style.animation = 'none';
        
        // Form içeriğini zorla görünür yap
        const formContent = modal.querySelector('#cokluBeceriFormContent');
        if (formContent) {
            formContent.style.setProperty('display', 'block', 'important');
            formContent.style.setProperty('visibility', 'visible', 'important');
            formContent.style.setProperty('opacity', '1', 'important');
            formContent.style.setProperty('height', 'auto', 'important');
            formContent.style.setProperty('min-height', '200px', 'important');
        }
        
        // Modal'ın tüm içeriğini zorla görünür yap
        const modalHeader = modal.querySelector('#cokluBeceriHeader');
        const modalForm = modal.querySelector('#cokluBeceriForm');
        const modalContent = modal.querySelector('div[style*="background: white"]');
        
        if (modalHeader) {
            modalHeader.style.setProperty('display', 'block', 'important');
            modalHeader.style.setProperty('visibility', 'visible', 'important');
        }
        
        if (modalForm) {
            modalForm.style.setProperty('display', 'block', 'important');
            modalForm.style.setProperty('visibility', 'visible', 'important');
        }
        
        if (modalContent) {
            modalContent.style.setProperty('display', 'block', 'important');
            modalContent.style.setProperty('visibility', 'visible', 'important');
        }
        
        // Modal'ın tüm child elementlerini zorla görünür yap
        const allChildren = modal.querySelectorAll('*');
        allChildren.forEach(child => {
            child.style.setProperty('display', 'block', 'important');
            child.style.setProperty('visibility', 'visible', 'important');
            child.style.setProperty('opacity', '1', 'important');
        });
        
        // Modal'ı tekrar konumlandır
        setTimeout(() => {
            modal.style.setProperty('position', 'fixed', 'important');
            modal.style.setProperty('top', '50%', 'important');
            modal.style.setProperty('left', '50%', 'important');
            modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            modal.style.setProperty('z-index', '99999', 'important');
        }, 100);
    }
    
    // Organizasyon adını ID'ye göre al
    function getOrganizationNameById(organizationId) {
        console.log(`🔍 Organizasyon adı aranıyor: ID ${organizationId}`);
        
        // Önce global değişkenden kontrol et
        if (window.clickedOrganizationGlobal) {
            console.log(`✅ Global organizasyon adı bulundu: ${window.clickedOrganizationGlobal}`);
            return window.clickedOrganizationGlobal;
        }
        
        // Organizasyon tablosundan adı al
        const organizationRows = document.querySelectorAll('#organizationsTableBody tr');
        for (let row of organizationRows) {
            const idCell = row.cells[0];
            if (idCell && idCell.textContent.trim() === organizationId.toString()) {
                const nameCell = row.cells[1];
                const orgName = nameCell ? nameCell.textContent.trim() : `Organizasyon ${organizationId}`;
                console.log(`✅ Tablodan organizasyon adı bulundu: ${orgName}`);
                return orgName;
            }
        }
        
        // Eğer bulunamazsa varsayılan ad
        const defaultName = `Organizasyon ${organizationId}`;
        console.log(`⚠️ Organizasyon adı bulunamadı, varsayılan: ${defaultName}`);
        return defaultName;
    }
    
    // Çoklu beceri modal içeriğini güncelle
    function updateCokluBeceriModalContent(organizationId, organizationName, personName) {
        console.log('🔍 updateCokluBeceriModalContent çağrıldı:', {organizationId, organizationName, personName});
        
        // Modal'ın başlığını güncelle
        const modalHeader = document.querySelector('#cokluBeceriHeader h3');
        if (modalHeader) {
            modalHeader.innerHTML = `<i class="fas fa-layer-group" style="color: #FFD700; font-size: 28px;"></i>Çoklu Beceri`;
            console.log('✅ Modal başlığı güncellendi');
        }
        
        // Modal'ın açıklamasını güncelle
        const modalDescription = document.getElementById('cokluBeceriDescription');
        if (modalDescription) {
            modalDescription.textContent = `${organizationName} organizasyonu için çoklu beceri seçimi yapın`;
            console.log('✅ Modal açıklaması güncellendi');
        }
        
        
        // Organizasyon adını güncelle
        const organizationNameElement = document.getElementById('organizationName');
        if (organizationNameElement) {
            organizationNameElement.textContent = organizationName;
            console.log('✅ Organizasyon adı güncellendi:', organizationName);
        }
        
        // Organizasyon checkbox'ını güncelle
        const organizationCheckbox = document.getElementById('organizationCheckbox');
        if (organizationCheckbox) {
            organizationCheckbox.setAttribute('data-organization-id', organizationId);
            organizationCheckbox.setAttribute('data-person-name', personName);
            console.log('✅ Checkbox güncellendi');
        }
        
        // Butonları kontrol et (Temizle, Eğitim Planı, Kaydet)
        const temizleBtn = document.querySelector('button[onclick="clearCokluBeceriForm()"]');
        const egitimPlaniBtn = document.querySelector('button[onclick="goToEgitimPlani()"]');
        const kaydetBtn = document.querySelector('button[onclick="saveCokluBeceriForm()"]');
        
        console.log('🔍 Temizle Butonu:', temizleBtn);
        console.log('🔍 Eğitim Planı Butonu:', egitimPlaniBtn);
        console.log('🔍 Kaydet Butonu:', kaydetBtn);
        
        if (temizleBtn && egitimPlaniBtn && kaydetBtn) {
            console.log('✅ Tüm butonlar bulundu');
            
            // Butonları zorla görünür yap ve yan yana düzenle
            temizleBtn.style.setProperty('display', 'flex', 'important');
            temizleBtn.style.setProperty('visibility', 'visible', 'important');
            temizleBtn.style.setProperty('opacity', '1', 'important');
            temizleBtn.style.setProperty('flex', '1', 'important');
            temizleBtn.style.setProperty('min-width', '0', 'important');
            
            egitimPlaniBtn.style.setProperty('display', 'flex', 'important');
            egitimPlaniBtn.style.setProperty('visibility', 'visible', 'important');
            egitimPlaniBtn.style.setProperty('opacity', '1', 'important');
            egitimPlaniBtn.style.setProperty('flex', '1', 'important');
            egitimPlaniBtn.style.setProperty('min-width', '0', 'important');
            
            kaydetBtn.style.setProperty('display', 'flex', 'important');
            kaydetBtn.style.setProperty('visibility', 'visible', 'important');
            kaydetBtn.style.setProperty('opacity', '1', 'important');
            kaydetBtn.style.setProperty('flex', '1', 'important');
            kaydetBtn.style.setProperty('min-width', '0', 'important');
            
            // Butonların parent container'ını da zorla flex yap
            const buttonContainer = temizleBtn.parentElement;
            if (buttonContainer) {
                buttonContainer.classList.add('form-actions');
                buttonContainer.style.setProperty('display', 'flex', 'important');
                buttonContainer.style.setProperty('justify-content', 'space-between', 'important');
                buttonContainer.style.setProperty('gap', '10px', 'important');
                buttonContainer.style.setProperty('flex-wrap', 'nowrap', 'important');
                buttonContainer.style.setProperty('align-items', 'center', 'important');
            }
            
            console.log('✅ Butonlar zorla görünür yapıldı ve yan yana düzenlendi');
        } else {
            console.error('❌ Bazı butonlar bulunamadı!');
        }
        
        console.log(`✅ Modal içeriği güncellendi: ${organizationName} (${organizationId})`);
    }
    
    // Çoklu beceri modal'ını hücrenin altına konumlandır
    function positionCokluBeceriModalBelowCell(modal, clickedElement) {
        // Modal'ı merkeze konumlandır (hücrenin altına değil)
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '99999';
        
        console.log(`✅ Modal merkeze konumlandırıldı`);
    }
    
    // Eğitim planı sayfasına git
    function goToEgitimPlani() {
        console.log('🎓 Eğitim planı sayfasına yönlendiriliyor...');
        window.location.href = 'egitim_plani.html';
    }
    
    // Çoklu beceri formunu temizle
    function clearCokluBeceriForm() {
        console.log('🧹 Çoklu beceri formu temizleniyor...');
        
        const checkbox = document.getElementById('organizationCheckbox');
        if (checkbox) {
            checkbox.checked = false;
        }
        
        console.log('✅ Form temizlendi');
    }
    
    // Çoklu beceri formunu kaydet
    function saveCokluBeceriForm() {
        console.log('💾 Çoklu beceri formu kaydediliyor...');
        
        const checkbox = document.getElementById('organizationCheckbox');
        if (!checkbox) {
            console.error('❌ Checkbox bulunamadı');
            return;
        }
        
        const organizationId = checkbox.getAttribute('data-organization-id');
        const personName = checkbox.getAttribute('data-person-name');
        const isSelected = checkbox.checked;
        
        if (!organizationId || !personName) {
            console.error('❌ Organizasyon ID veya kişi adı bulunamadı');
            return;
        }
        
        console.log(`📝 Kaydediliyor: Organizasyon ${organizationId}, Kişi ${personName}, Seçildi: ${isSelected}`);
        
        // Burada API çağrısı yapılabilir
        // Şimdilik sadece console'a yazdırıyoruz
        alert(`Çoklu beceri seçimi kaydedildi!\nOrganizasyon: ${organizationId}\nKişi: ${personName}\nSeçildi: ${isSelected ? 'Evet' : 'Hayır'}`);
        
        // Modal'ı kapat
        const modal = document.getElementById('cokluBeceriModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        console.log('✅ Form kaydedildi ve modal kapatıldı');
    }
    
    // Modal'ı hücrenin altına konumlandır (eski fonksiyon - kaldırılabilir)
    function positionModalBelowCell(modal, clickedElement) {
        // Tıklanan elementin konumunu al
        const rect = clickedElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Modal'ın boyutunu küçült
        const modalContent = modal.querySelector('div');
        if (modalContent) {
            modalContent.style.cssText = `
                background-color: #fefefe;
                margin: 0;
                padding: 15px;
                border: 1px solid #888;
                border-radius: 8px;
                width: 400px;
                max-width: 90vw;
                max-height: 60vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                position: absolute;
                left: ${rect.left + scrollLeft}px;
                top: ${rect.bottom + scrollTop + 5}px;
                z-index: 10001;
            `;
        }
        
        // Modal'ın arka planını kaldır (sadece içerik görünsün)
        modal.style.cssText = `
            display: block;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
            pointer-events: none;
        `;
        
        // Modal içeriğine pointer events ekle
        if (modalContent) {
            modalContent.style.pointerEvents = 'auto';
        }
        
        // Ekran sınırlarını kontrol et ve gerekirse konumu ayarla
        setTimeout(() => {
            const modalRect = modalContent.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Sağ kenardan taşarsa sola kaydır
            if (modalRect.right > viewportWidth) {
                modalContent.style.left = `${viewportWidth - modalRect.width - 10}px`;
            }
            
            // Alt kenardan taşarsa yukarı kaydır
            if (modalRect.bottom > viewportHeight) {
                modalContent.style.top = `${rect.top + scrollTop - modalRect.height - 5}px`;
            }
        }, 10);
    }
    
    // Çoklu beceri modal'ını oluştur
    function createMultiSkillModal() {
        const modal = document.createElement('div');
        modal.id = 'multiSkillModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            border-radius: 10px;
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #27ae60;">🎯 Çoklu Beceri</h2>
                <button id="closeMultiSkillModal" style="background: #e74c3c; color: white; border: none; border-radius: 5px; padding: 8px 12px; cursor: pointer;">✕</button>
            </div>
            <div id="multiSkillContent">
                <div style="text-align: center; padding: 20px;">
                    <div class="spinner"></div>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Kapatma olayları
        document.getElementById('closeMultiSkillModal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Modal dışına tıklandığında kapat
        document.addEventListener('click', (e) => {
            if (modal.style.display === 'block' && !modal.contains(e.target)) {
                modal.style.display = 'none';
            }
        });
        
        return modal;
    }
    
    // Çoklu beceri modal içeriğini güncelle
    function updateMultiSkillModalContent(modal, organizationId, personName, personId) {
        const content = modal.querySelector('#multiSkillContent');
        
        // Organizasyon adını al
        fetch('api/get_organizations.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const organization = data.organizations.find(org => org.id == organizationId);
                    const organizationName = organization ? organization.name : 'Bilinmeyen Organizasyon';
                    
                    // Modal başlığını güncelle
                    const title = modal.querySelector('h2');
                    title.innerHTML = `🎯 Çoklu Beceri`;
                    
                    // İçeriği güncelle
                    content.innerHTML = `
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">👤 Kişi: ${personName}</h3>
                            <h3 style="color: #2c3e50; margin-bottom: 20px;">🏢 Organizasyon: Çoklu Beceri ✅</h3>
                        </div>
                        
                        <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 style="color: #27ae60; margin-top: 0;">✅ Tamamlanan Beceriler</h4>
                            <div id="completedSkills">
                                <div class="spinner"></div>
                                <p>Beceriler yükleniyor...</p>
                            </div>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 style="color: #856404; margin-top: 0;">🎯 Çoklu Beceri Seçenekleri</h4>
                            <div id="multiSkillOptions">
                                <p>Çoklu beceri seçenekleri yükleniyor...</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button id="saveMultiSkills" style="background: #27ae60; color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; font-size: 16px;">
                                💾 Çoklu Becerileri Kaydet
                            </button>
                        </div>
                    `;
                    
                    // Tamamlanan becerileri yükle
                    loadCompletedSkills(organizationId, personId);
                    
                    // Çoklu beceri seçeneklerini yükle
                    loadMultiSkillOptions(organizationId);
                    
                    // Kaydet butonuna event listener ekle
                    setTimeout(() => {
                        const saveButton = document.getElementById('saveMultiSkills');
                        if (saveButton) {
                            saveButton.addEventListener('click', () => {
                                saveMultiSkills(organizationId, personName, personId);
                            });
                        }
                    }, 100);
                    
                } else {
                    content.innerHTML = '<p style="color: red;">Organizasyon bilgisi alınamadı.</p>';
                }
            })
            .catch(error => {
                console.error('Organizasyon bilgisi alma hatası:', error);
                content.innerHTML = '<p style="color: red;">Hata oluştu.</p>';
            });
    }
    
    // Tamamlanan becerileri yükle
    function loadCompletedSkills(organizationId, personId) {
        const completedSkillsDiv = document.getElementById('completedSkills');
        
        fetch('api/check_organization_skills_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization_id: organizationId,
                person_id: personId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Bu kişinin tamamlanan becerilerini al
                fetch('api/get_person_completed_skills.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        organization_id: organizationId,
                        person_id: personId
                    })
                })
                .then(response => response.json())
                .then(skillsData => {
                    if (skillsData.success && skillsData.skills.length > 0) {
                        let skillsHtml = '<ul style="margin: 0; padding-left: 20px;">';
                        skillsData.skills.forEach(skill => {
                            skillsHtml += `<li style="margin-bottom: 5px; color: #27ae60;">✅ ${skill.skill_name}</li>`;
                        });
                        skillsHtml += '</ul>';
                        completedSkillsDiv.innerHTML = skillsHtml;
                    } else {
                        completedSkillsDiv.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">Henüz tamamlanan beceri yok.</p>';
                    }
                })
                .catch(error => {
                    console.error('Tamamlanan beceriler yüklenemedi:', error);
                    completedSkillsDiv.innerHTML = '<p style="color: red;">Beceriler yüklenemedi.</p>';
                });
            } else {
                completedSkillsDiv.innerHTML = '<p style="color: red;">Beceri durumu alınamadı.</p>';
            }
        })
        .catch(error => {
            console.error('Beceri durumu kontrol hatası:', error);
            completedSkillsDiv.innerHTML = '<p style="color: red;">Hata oluştu.</p>';
        });
    }
    
    // Çoklu beceri seçeneklerini yükle
    function loadMultiSkillOptions(organizationId) {
        const multiSkillOptionsDiv = document.getElementById('multiSkillOptions');
        
        // Tüm organizasyonlardaki becerileri al
        fetch('api/get_all_organization_skills.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Mevcut organizasyonun becerilerini filtrele
                    const currentOrgSkills = data.skills.filter(skill => skill.organization_id != organizationId);
                    
                    if (currentOrgSkills.length > 0) {
                        let optionsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">';
                        currentOrgSkills.forEach(skill => {
                            optionsHtml += `
                                <label style="display: flex; align-items: center; padding: 8px; background: white; border-radius: 5px; cursor: pointer; border: 1px solid #ddd;">
                                    <input type="checkbox" value="${skill.id}" data-org-id="${skill.organization_id}" data-skill-name="${skill.skill_name}" style="margin-right: 8px;">
                                    <span style="font-size: 14px;">${skill.skill_name}</span>
                                </label>
                            `;
                        });
                        optionsHtml += '</div>';
                        multiSkillOptionsDiv.innerHTML = optionsHtml;
                    } else {
                        multiSkillOptionsDiv.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">Çoklu beceri seçeneği bulunamadı.</p>';
                    }
                } else {
                    multiSkillOptionsDiv.innerHTML = '<p style="color: red;">Beceri seçenekleri yüklenemedi.</p>';
                }
            })
            .catch(error => {
                console.error('Beceri seçenekleri yükleme hatası:', error);
                multiSkillOptionsDiv.innerHTML = '<p style="color: red;">Hata oluştu.</p>';
            });
    }
    
    // Çoklu becerileri kaydet
    function saveMultiSkills(organizationId, personName, personId) {
        const checkboxes = document.querySelectorAll('#multiSkillOptions input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('Lütfen en az bir çoklu beceri seçin!');
            return;
        }
        
        const selectedSkills = [];
        checkboxes.forEach(checkbox => {
            selectedSkills.push({
                skill_id: checkbox.value,
                organization_id: checkbox.getAttribute('data-org-id'),
                skill_name: checkbox.getAttribute('data-skill-name')
            });
        });
        
        console.log('Seçilen çoklu beceriler:', selectedSkills);
        
        // Kaydet butonunu devre dışı bırak
        const saveButton = document.getElementById('saveMultiSkills');
        saveButton.disabled = true;
        saveButton.innerHTML = '💾 Kaydediliyor...';
        
        // API'ye gönder
        fetch('api/save_multi_skills.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                person_id: personId,
                person_name: personName,
                organization_id: organizationId,
                selected_skills: selectedSkills
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Çoklu beceriler başarıyla kaydedildi!');
                // Modal'ı kapat
                const modal = document.getElementById('multiSkillModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            } else {
                alert('Kaydetme hatası: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Çoklu beceri kaydetme hatası:', error);
            alert('Bir hata oluştu!');
        })
        .finally(() => {
            // Butonu eski haline getir
            saveButton.disabled = false;
            saveButton.innerHTML = '💾 Çoklu Becerileri Kaydet';
        });
    }
    

    function openTemelBecerilerModal(imgElement) {
        console.log('🔍 openTemelBecerilerModal fonksiyonu çağrıldı');
        
        // Resmin dosya adını al
        const imgSrc = imgElement.src;
        const fileName = imgSrc.split('/').pop(); // Dosya adını al 
        
        // URL decode yap (boşluk karakterleri için)
        const decodedFileName = decodeURIComponent(fileName);
        
        console.log('📁 Resim dosya adı:', fileName); // Debug için
        console.log('📁 Decoded dosya adı:', decodedFileName); // Debug için
        console.log('🔍 Pie (2).png kontrolü yapılıyor...');
        
        // Pie (3).png ise çoklu beceri formu aç (bu fonksiyon yanlış çağrılmış)
        if (decodedFileName === "pie (3).png" || fileName === "pie%20(3).png") {
            console.log('⚠️ Pie (3).png tespit edildi! Bu fonksiyon yanlış çağrılmış, çoklu beceri formu açılmalı...');
            return; // Bu fonksiyondan çık
        }
        
        // Pie (2).png için temel beceri formu aç
        if (decodedFileName === "pie (2).png" || fileName === "pie%20(2).png") {
            console.log('✅ Pie (2).png tespit edildi! Temel beceri formu açılıyor...');
            
            const modal = document.getElementById("temelBecerilerModal");
            console.log('🔍 Temel Beceri Modal element bulundu mu?', modal);
            
            if (!modal) {
                console.error('❌ temelBecerilerModal elementi bulunamadı!');
                return;
            }
            
            const rect = imgElement.getBoundingClientRect();
            console.log('📍 Resim pozisyonu:', rect);
            
            // Modalı merkeze yerleştir
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.position = 'fixed';
            modal.style.display = 'block';
            modal.currentImg = imgElement;
            
            console.log('✅ Modal pozisyonu ayarlandı ve gösterildi');
            
            // Organizasyon adını global değişkende sakla
            const cell = imgElement.closest('td');
            const row = cell.parentElement;
            const table = row.closest('table');
            const colIndex = Array.from(cell.parentElement.children).indexOf(cell);

            console.log('🔍 Pie (3).png tıklandı - Sütun indexi:', colIndex);
            
            const thead = table.querySelector('thead');
            if (thead) {
                const headerRow = thead.querySelector('tr');
                if (headerRow && headerRow.children[colIndex]) {
                    clickedOrganizationGlobal = headerRow.children[colIndex].textContent.trim();
                    console.log('✅ Global organizasyon adı saklandı:', clickedOrganizationGlobal);
                    console.log('🔍 Organizasyon sütunu:', colIndex + 1, '-', clickedOrganizationGlobal);
                } else {
                    console.warn('⚠️ Header row veya sütun bulunamadı');
                }
            } else {
                console.warn('⚠️ Thead bulunamadı');
            }
            
            // Organizasyon ID'sini doğru sütundan al
            const organizationId = cell.getAttribute('data-organization-id');
            console.log('🔍 Cell Organization ID:', organizationId);
            
            // Eğer cell'de organization ID yoksa, sütun indexine göre belirle
            let finalOrganizationId = organizationId;
            if (!finalOrganizationId) {
                // Sütun 7'deki organizasyon için ID belirle
                if (colIndex === 7) {
                    finalOrganizationId = '1'; // Varsayılan organizasyon ID
                    console.log('🔍 Varsayılan organizasyon ID kullanılıyor:', finalOrganizationId);
                }
            }
            
            // Temel beceri modal'ını aç (çoklu beceri değil!)
            console.log('✅ Temel beceri modal açılıyor...');
            
            // Modal'ın içeriğini temizle ve yeniden yükle
            loadOrganizationSkillsForModal(imgElement);
            
            console.log('✅ Temel beceri modal başarıyla açıldı');
            return;
        } else {
            console.log('❌ Pie (3).png değil, diğer kontroller yapılıyor...');
        }
        
        // Sadece pie (2).png için temel beceri formu aç
        if (decodedFileName !== "pie (2).png" && fileName !== "pie (2).png") {
            console.log('Bu resim için form açılmayacak');
            return; // Fonksiyondan çık, form açma
        }
        
        const modal = document.getElementById("temelBecerilerModal");
        const rect = imgElement.getBoundingClientRect();
        
        // Modalı resmin yanına yerleştir
        modal.style.top = (window.scrollY + rect.top) + 'px';
        modal.style.left = (window.scrollX + rect.right + 10) + 'px';
        modal.style.position = 'absolute';
        modal.style.display = 'block';
        modal.currentImg = imgElement;
        
        // Organizasyon becerilerini yükle
        loadOrganizationSkillsForModal(imgElement);
    }

         function closeTemelBecerilerModal() {
         const modal = document.getElementById("temelBecerilerModal");
         modal.style.display = "none";
         modal.currentImg = null;
         // Global değişkeni temizleme
         // clickedOrganizationGlobal = null; // Bu satırı yorum satırı yaptık çünkü eğitim planı sayfasında hala gerekli
     }

     // Çoklu beceri modalını kapat
     function closeCokluBeceriModal() {
         const modal = document.getElementById("cokluBeceriModal");
         modal.style.display = "none";
         clickedOrganizationGlobal = null;
     }

     // Çoklu beceri modalını yükle
     function loadCokluBeceriForModal(imgElement) {
         console.log('🔄 loadCokluBeceriForModal fonksiyonu başladı');
         
         const modal = document.getElementById("cokluBeceriModal");
         console.log('🔍 Modal bulundu mu?', modal);
         
         if (!modal) {
             console.error('❌ Modal bulunamadı!');
             return;
         }
         
         const loading = modal.querySelector('#cokluBeceriLoading');
         const content = modal.querySelector('#cokluBeceriContent');
         const empty = modal.querySelector('#cokluBeceriEmpty');
         const tableBody = modal.querySelector('#cokluBeceriTableBody');
         
         console.log('🔍 Modal elementleri:', { loading, content, empty, tableBody });
         
         // Loading göster
         if (loading) {
             loading.style.display = 'block';
             console.log('✅ Loading gösterildi');
         }
         if (content) {
             content.style.display = 'none';
         }
         if (empty) {
             empty.style.display = 'none';
         }
         
         // Organizasyon adını al
         const organizationName = clickedOrganizationGlobal;
         console.log('🔍 Organizasyon adı:', organizationName);
         
         if (!organizationName) {
             console.warn('⚠️ Organizasyon adı bulunamadı, empty state gösteriliyor');
             if (loading) loading.style.display = 'none';
             if (empty) empty.style.display = 'block';
             return;
         }
         
         // Tabloyu doldur - sadece tıklanan organizasyon
         if (tableBody) {
             tableBody.innerHTML = '';
             console.log('✅ Table body temizlendi');
             
             const row = document.createElement('tr');
             row.innerHTML = `
                 <td style="padding: 15px; border-bottom: 1px solid #e9ecef; font-size: 14px; font-weight: 500; color: #333;">
                     ${organizationName}
                 </td>
                 <td style="padding: 15px; border-bottom: 1px solid #e9ecef; text-align: center;">
                     <input type="checkbox" 
                            style="width: 20px; height: 20px; border: 2px solid #27ae60; border-radius: 4px; cursor: pointer; transition: all 0.3s ease; position: relative; appearance: none; background: white;"
                            onchange="toggleCokluBeceriCheckbox(this)"
                            data-organization="${organizationName}">
                 </td>
             `;
             
             tableBody.appendChild(row);
             console.log('✅ Tablo satırı eklendi');
         }
         
         // Loading gizle, içeriği göster
         if (loading) {
             loading.style.display = 'none';
             console.log('✅ Loading gizlendi');
         }
         if (content) {
             content.style.display = 'block';
             console.log('✅ İçerik gösterildi');
         }
         
         console.log('✅ loadCokluBeceriForModal tamamlandı');
     }

     // Çoklu beceri checkbox'ını toggle et
     function toggleCokluBeceriCheckbox(checkbox) {
         if (checkbox.checked) {
             checkbox.style.background = '#27ae60';
             checkbox.style.borderColor = '#27ae60';
         } else {
             checkbox.style.background = 'white';
             checkbox.style.borderColor = '#27ae60';
         }
     }

     // Çoklu beceri seçimlerini temizle
     function clearCokluBeceri() {
         const checkboxes = document.querySelectorAll('#cokluBeceriTableBody input[type="checkbox"]');
         checkboxes.forEach(checkbox => {
             checkbox.checked = false;
             checkbox.style.background = 'white';
             checkbox.style.borderColor = '#27ae60';
         });
         showSuccessNotification('Çoklu beceri seçimleri temizlendi');
     }

     // Çoklu beceri seçimlerini kaydet
     function saveCokluBeceri() {
         const checkboxes = document.querySelectorAll('#cokluBeceriTableBody input[type="checkbox"]');
         const selectedOrganizations = [];
         
         checkboxes.forEach(checkbox => {
             if (checkbox.checked) {
                 selectedOrganizations.push(checkbox.getAttribute('data-organization'));
             }
         });
         
         if (selectedOrganizations.length === 0) {
             showSuccessNotification('Lütfen en az bir organizasyon seçin', 'warning');
             return;
         }
         
         console.log('Seçilen organizasyonlar:', selectedOrganizations);
         showSuccessNotification(`${selectedOrganizations.length} organizasyon seçildi ve kaydedildi`);
         
         // Modalı kapat
         closeCokluBeceriModal();
     }

 function getActualColumnIndex(cell) {
    const row = cell.parentElement;
    let realIndex = 0;
    for (const td of row.children) {
        const colspan = td.getAttribute('colspan') ? parseInt(td.getAttribute('colspan')) : 1;
        if (td === cell) {
            return realIndex;
        }
        realIndex += colspan;
    }
    return -1; // bulunamadı
}

function loadOrganizationSkillsForModal(imgElement) {
    // Loading durumunu göster
    document.getElementById('temelBecerilerLoading').style.display = 'block';
    document.getElementById('temelBecerilerContent').style.display = 'none';
    document.getElementById('temelBecerilerEmpty').style.display = 'none';
    
    try {
        // Resmin bulunduğu hücreden organizasyon bilgisini al
        const cell = imgElement.closest('td');
        if (!cell) throw new Error('Resim hücresi bulunamadı');
        
        const row = cell.parentElement;
        const table = row.closest('table');
        if (!table) throw new Error('Tablo bulunamadı');
        
        // colspan dikkate alınarak gerçek sütun indeksini hesapla
        const colIndex = getActualColumnIndex(cell);
        console.log('🔍 Resim tıklanan hücre gerçek sütun indeksi:', colIndex);
        
        // Sütun indeksini -3 ile düzeltiyoruz (senin ihtiyaçlarına göre)
        const adjustedColIndex = colIndex - 3;
        console.log('🔍 Düzeltilmiş sütun indeksi:', adjustedColIndex);
        
        // Organizasyon verisini al
        fetch('api/get_organizations.php')
            .then(response => response.json())
            .then(data => {
                if (!data.success) throw new Error('Organizasyonlar yüklenemedi');
                console.log('📋 Tüm organizasyonlar:', data.organizations);
                
                // Sütun pozisyonuna göre organizasyonu bul
                let organization = data.organizations.find(org => parseInt(org.column_position) === adjustedColIndex);
                
                // Eğer bulunamazsa, organizasyon adına göre bulmayı dene
                if (!organization) {
                    console.log('⚠️ Sütun pozisyonu ile bulunamadı, organizasyon adı ile aranıyor...');
                    
                    const thead = table.querySelector('thead');
                    if (thead) {
                        const headerRow = thead.querySelector('tr');
                        if (headerRow) {
                            // Gerçek sütun indeksini kullanarak başlığı al
                            let headerText = null;
                            let realHeaderIndex = 0;
                            for (const th of headerRow.children) {
                                const colspan = th.getAttribute('colspan') ? parseInt(th.getAttribute('colspan')) : 1;
                                if (realHeaderIndex <= colIndex && colIndex < realHeaderIndex + colspan) {
                                    headerText = th.textContent.trim();
                                    break;
                                }
                                realHeaderIndex += colspan;
                            }

                            if (headerText) {
                                console.log('📝 Sütun başlığı:', headerText);

                                // Organizasyon adına göre arama
                                organization = data.organizations.find(org =>
                                    org.name && org.name.trim() === headerText
                                );
                            } else {
                                console.warn('⚠️ Başlık bulunamadı');
                            }
                        } else {
                            console.warn('⚠️ Başlık satırı bulunamadı');
                        }
                    } else {
                        console.warn('⚠️ Thead bulunamadı');
                    }
                }
                
                if (!organization) {
                    console.log('❌ Organizasyon bulunamadı - Sütun indeksi:', adjustedColIndex);
                    throw new Error('Organizasyon bulunamadı');
                }
                
                console.log('✅ Organizasyon bulundu:', organization.name, '(ID:', organization.id, ')');
                
                // Organizasyon becerilerini yükle
                return fetch('get_organization_skills.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ organization_id: organization.id }),
                });
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('temelBecerilerLoading').style.display = 'none';
                console.log('📋 Organizasyon becerileri yanıtı:', data);
                
                if (data.success && Array.isArray(data.skills) && data.skills.length > 0) {
                    displayOrganizationSkillsInModal(data.skills);
                    document.getElementById('temelBecerilerContent').style.display = 'block';
                    console.log('✅ Beceriler başarıyla yüklendi:', data.skills.length, 'beceri');
                } else {
                    document.getElementById('temelBecerilerEmpty').style.display = 'block';
                    console.log('ℹ️ Bu organizasyon için beceri bulunamadı');
                }
            })
            .catch(error => {
                console.error('❌ Beceri yükleme hatası:', error);
                document.getElementById('temelBecerilerLoading').style.display = 'none';
                document.getElementById('temelBecerilerEmpty').style.display = 'block';
            });
        
    } catch (err) {
        console.error('❌ Fonksiyon içi hata:', err);
        document.getElementById('temelBecerilerLoading').style.display = 'none';
        document.getElementById('temelBecerilerEmpty').style.display = 'block';
    }
}



                 function displayOrganizationSkillsInModal(skills) {
         const tbody = document.getElementById('temelBecerilerTableBody');
         tbody.innerHTML = '';
         
         // Tıklanan kişiyi al
         const clickedPerson = getClickedPerson();
         const clickedOrganization = getClickedOrganization();
         
         console.log('🔍 Beceri kontrolü:', { clickedPerson, clickedOrganization });
         
         // Planlanan becerileri kontrol et
         fetch('api/get_planned_skills.php')
             .then(response => response.json())
             .then(data => {
                 if (data.success) {
                     console.log('📋 Tüm planlanan beceriler:', data.planned_skills);
                     
                     const plannedSkills = data.planned_skills.filter(ps => 
                         ps.person_name === clickedPerson && 
                         ps.organization_name === clickedOrganization
                     );
                     
                     console.log('📋 Bu kişi için planlanan beceriler:', plannedSkills);
                     
                     skills.forEach(skill => {
                         const row = document.createElement('tr');
                         
                         // Bu beceri planlandı mı kontrol et (trim ile karşılaştır)
                         const isPlanned = plannedSkills.some(ps => 
                             ps.skill_name.trim() === skill.skill_name.trim()
                         );
                         
                         // Eğer beceri planlandıysa checkbox yerine durum yazısı göster
                         const plannedSkill = plannedSkills.find(ps => 
                             ps.skill_name.trim() === skill.skill_name.trim()
                         );
                         
                         console.log(`🔍 Beceri "${skill.skill_name}": isPlanned=${isPlanned}, teacher_id=${plannedSkill ? plannedSkill.teacher_id : 'N/A'}, success_status=${plannedSkill ? plannedSkill.success_status : 'N/A'}`);
                         
                         if (isPlanned) {
                             // 3 durumlu mantık: teacher_id ve success_status'a göre durum belirle
                             let statusText = '';
                             let statusColor = '';
                             let iconClass = '';

                             if (!plannedSkill || !plannedSkill.teacher_id) {
                                 // Öğretmen seçilmemiş
                                 statusText = 'İstek Gönderildi';
                                 statusColor = '#6c757d'; // gri
                                 iconClass = 'fas fa-paper-plane';
                             } else if (plannedSkill.success_status === 'completed') {
                                 // Öğretmen seçilmiş ve başarı durumu tikli
                                 statusText = 'Tamamlandı';
                                 statusColor = '#28a745'; // yeşil
                                 iconClass = 'fas fa-check-double';
                             } else {
                                 // Öğretmen seçilmiş ama başarı durumu tikli değil
                                 statusText = 'Planlandı';
                                 statusColor = '#FFA500'; // turuncu
                                 iconClass = 'fas fa-check-circle';
                             }

                             // Durum yazısı göster
                             row.innerHTML = `
                                 <td style="padding: 15px; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #333; font-size: 14px;">
                                     <i class="fas fa-star" style="color: #FFD700; margin-right: 8px; font-size: 12px;"></i>${skill.skill_name.trim()}
                                 </td>
                                 <td style="padding: 15px; border-bottom: 1px solid #e9ecef; text-align: center;">
                                     <span style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px;">
                                         <i class="${iconClass}" style="font-size: 10px;"></i>
                                         ${statusText}
                                     </span>
                                 </td>
                             `;
                         } else {
                             // Normal checkbox göster
                             row.innerHTML = `
                                 <td style="padding: 15px; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #333; font-size: 14px;">
                                     <i class="fas fa-circle" style="color: #667eea; margin-right: 8px; font-size: 8px;"></i>${skill.skill_name.trim()}
                                 </td>
                                 <td style="padding: 15px; border-bottom: 1px solid #e9ecef; text-align: center;">
                                     <input type="checkbox" id="skill_${skill.id}" name="skill_${skill.id}">
                                 </td>
                             `;
                         }
                         
                         tbody.appendChild(row);
                     });
                 } else {
                     console.error('❌ Planlanan beceriler yüklenemedi:', data.message);
                     // Hata durumunda normal checkbox'ları göster
                     skills.forEach(skill => {
                         const row = document.createElement('tr');
                         row.innerHTML = `
                             <td style="padding: 15px; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #333; font-size: 14px;">
                                 <i class="fas fa-circle" style="color: #667eea; margin-right: 8px; font-size: 8px;"></i>${skill.skill_name.trim()}
                             </td>
                             <td style="padding: 15px; border-bottom: 1px solid #e9ecef; text-align: center;">
                                 <input type="checkbox" id="skill_${skill.id}" name="skill_${skill.id}">
                             </td>
                         `;
                         tbody.appendChild(row);
                     });
                 }
             })
             .catch(error => {
                 console.error('❌ Planlanan beceriler kontrol edilemedi:', error);
                 // Hata durumunda normal checkbox'ları göster
                 skills.forEach(skill => {
                     const row = document.createElement('tr');
                     row.innerHTML = `
                         <td style="padding: 15px; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #333; font-size: 14px;">
                             <i class="fas fa-circle" style="color: #667eea; margin-right: 8px; font-size: 8px;"></i>${skill.skill_name.trim()}
                         </td>
                         <td style="padding: 15px; border-bottom: 1px solid #e9ecef; text-align: center;">
                             <input type="checkbox" id="skill_${skill.id}" name="skill_${skill.id}">
                         </td>
                     `;
                     tbody.appendChild(row);
                 });
             });
     }

    function clearTemelBeceriler() {
        // Sadece checkbox'ları temizle (planlandı yazısı olan beceriler etkilenmez)
        const checkboxes = document.querySelectorAll('#temelBecerilerTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

                   function saveTemelBeceriler() {
          // Seçili becerileri al (sadece checkbox'ı olan beceriler)
          const selectedSkills = [];
          const checkboxes = document.querySelectorAll('#temelBecerilerTableBody input[type="checkbox"]:checked');
          
          checkboxes.forEach(checkbox => {
              const skillName = checkbox.closest('tr').querySelector('td:first-child').textContent.trim();
              selectedSkills.push(skillName);
          });

          // Bildirim göster
          if (selectedSkills.length > 0) {
              // Tıklanan resmin bulunduğu satırdaki kişiyi al
              const clickedPerson = getClickedPerson();
              
              // Organizasyon adını al
              const clickedOrganization = getClickedOrganization();
              
              console.log('💾 Kaydedilecek beceriler:', { clickedPerson, clickedOrganization, selectedSkills });
              
              // Planlanan becerileri veritabanına kaydet
              savePlannedSkillsToDatabase(clickedPerson, clickedOrganization, selectedSkills);
              
              showSuccessNotification(`Planlanan beceriler: ${selectedSkills.join(', ')}`);
              
              // Modalı kapat
              closeTemelBecerilerModal();
              
              // Kısa bir gecikme sonra eğitim planı sayfasına geç
              setTimeout(() => {
                  egitimPlaniSayfasinaGec(selectedSkills, clickedPerson);
              }, 500);
          } else {
              showSuccessNotification('Hiçbir beceri seçilmedi');
          }
      }
      //organizasyon ekle sutünundan sonraki organization-dot sınıfına sahip sütunları silme fonksiyonu
function removeColumnsAfterRotatedHeader(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  // rotated-header sütun indexini bul
  const headers = table.querySelectorAll('thead tr th');
  let rotatedIndex = -1;
  headers.forEach((th, i) => {
    if (th.classList.contains('rotated-header')) {
      rotatedIndex = i;
    }
  });

  if (rotatedIndex === -1) return;

  // Her satırda rotatedIndex'den sonraki sütunları kontrol et
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = row.children;
    // sondan başa doğru gidelim ki indeks karışmasın
    for(let i = cells.length - 1; i > rotatedIndex; i--) {
      if (cells[i].classList.contains('organization-dot')) {
        row.removeChild(cells[i]);
      }
    }
  });
}

// Fonksiyonu çağır
removeColumnsAfterRotatedHeader('excel-table');
function finishEditing() {
  if (!editingCell) return;

  const input = editingCell.querySelector('input');
  if (!input) return;

  const newValue = input.value.trim();
  editingCell.removeChild(input);
  editingCell.innerText = newValue || '—';

  if (newValue === '' || newValue === '—') {
    editingCell = null; // Burada bırakabiliriz
    return; // Boşsa kaydetme
  }

  const row = editingCell.parentElement;
  const allRows = Array.from(table.rows);
  const rowIndex = allRows.indexOf(row);

  const nameCell = row.cells[4];
  const personName = nameCell ? nameCell.innerText.trim() : null;

  if (!personName) {
    alert('Kişi bulunamadı.');
    editingCell.innerText = '—';
    editingCell = null;
    return;
  }

  const fieldMap = {
    1: 'company_name',
    2: 'title',
    3: 'registration_no'
  };

  const cellIndex = editingCell.cellIndex;
  const fieldName = fieldMap[cellIndex];

  if (!fieldName) {
    alert('Geçersiz sütun');
    editingCell = null;
    return;
  }

  // fetch işlemi başladıktan sonra editingCell'i null yapma
  fetch('api/get_person_id.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: personName })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success || !data.personId) {
      alert('Kişi ID bulunamadı: ' + personName);
      if(editingCell) editingCell.innerText = '—'; // null değilse atama yap
      editingCell = null;
      return;
    }

    const personId = data.personId;
    const dataToSave = {
      personId: personId,
      fieldName: fieldName,  // buraya sütun ismini yolluyoruz
      newValue: newValue
    };

    return fetch('update-person.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave)
    });
  })
  .then(res => res ? res.json() : null)
  .then(data => {
    if (data) {
      if (data.success) {
        showSuccessNotification('✅ '+'Başarıyla Kaydedildi');
      } else {
        showSearchResults('❌ Organizasyonlar yüklenemedi:' + (data.message || 'Bilinmeyen hata'));
      }
    }
    editingCell = null; // İşlem tamamlandı, null yap
  })
  .catch(err => {
    alert('Fetch hatası: ' + err.message);
    if(editingCell) editingCell.innerText = '—';
    editingCell = null;
  });

  // Burada editingCell'i null yapma, yukarıdaki fetch zincirinde yap
}









