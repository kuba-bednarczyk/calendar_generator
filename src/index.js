import html2canvas from 'html2canvas';
import {jsPDF} from "jspdf";

import logo from "./assets/logo.png";
import footerImg from "./assets/jesuschrist.webp";

document.querySelector('.calendar-form').addEventListener('submit', event => {
    event.preventDefault();

    const year = document.querySelector('#year').value;
    const month = document.querySelector('#month').value;
    const person = document.querySelector('#person').value;

    generateCalendar(year, month, person);

    document.querySelector('.calendar-container').style.display = 'block';
    document.querySelector("#print-btn").style.display = "block";
    document.getElementById('print-btn').addEventListener('click', downloadPrintableCalendar);

})

function generateCalendar(year, month, person) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const prevDaysInMonth = new Date(year, month - 1, 0).getDate();

    let calendarHTML = `
        <div class="header">
          <div class="logo">
            <img src=${logo} alt="logo-parafia">
          </div>
          <div class="calendar-info">
            <h1>MSZE GREGORIAŃSKIE</h1>
            <p>${getMonthName(month).toUpperCase()}</p>
            <h3>${year}</h3>
          </div>
        </div>
        <div class="calendar-content"> 
            <table>
                <tr class="table_header">
                    <th style="color: red; font-weight: 800;">NIEDZIELA</th>
                    <th>PONIEDZIALEK</th>
                    <th>WTOREK</th>
                    <th>SRODA</th>
                    <th>CZWARTEK</th>
                    <th>PIĄTEK</th>
                    <th>SOBOTA</th>
                </tr>
    `;

    const hours = [
        '(pozostaw puste)', '7:00', '7:30', '9:30', '11:30', '12:00', '15:00', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
    ];

    let day = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < 6; i++) {
        let row = '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                const prevDay = prevDaysInMonth - firstDay + j + 1;
                row += `<td class="prev-month"><div>${prevDay}</div></td>`;
            } else if (day > daysInMonth) {
                row += `<td class="next-month">
                            <div>${nextMonthDay}</div>
                            <select class="hour-select" style="display:none;">
                                <option value="">Wybierz godzinę</option>
                                ${hours.map(hour => `<option value="${hour}">${hour}</option>`).join('')}
                            </select>
                            <p class="selected-hour" style="display:none;"></p> 
                        </td>`;
                nextMonthDay++;
            } else {
                row += `<td>
                            <div>${day}</div>
                            <select class="hour-select">
                                <option value="">Wybierz godzinę</option>
                                ${hours.map(hour => `<option value="${hour}">${hour}</option>`).join('')}
                            </select>
                            <p class="selected-hour" style="display:none;"></p> 
                        </td>`;
                day++;
            }
        }
        row += '</tr>';
        calendarHTML += row;
    }

    calendarHTML += '</table></div>';

    // Footer
    calendarHTML += `
         <div class="footer">
            <div class="img-container">
                <img src=${footerImg} alt="jesus-christ-resurected">
            </div>
            <div class="mass-info">
                <h1>MSZE ŚWIĘTE GREGORIAŃSKIE <br>
                    W INTENCJI
                </h1>
                <p>&#10013; ${person.toUpperCase()}</p>
            </div>
        </div>
    `;

    document.querySelector('.calendar-container').innerHTML = calendarHTML;
    const nextMonthDays = document.querySelectorAll('.next-month');
    nextMonthDays.forEach(td => {
        td.addEventListener('click', function () {
            showSelect(this);
        });
    });

    const selectElements = document.querySelectorAll('.hour-select');
    selectElements.forEach(select => {
        select.addEventListener('change', function () {
            updateHour(this);
        });
    });
}


function showSelect(tdElement) {
    const select = tdElement.querySelector('.hour-select');
    const pElement = tdElement.querySelector('.selected-hour');

    if (select.style.display === 'block') return;

    select.style.display = 'block';
    pElement.style.display = 'none';
}

function updateHour(selectElement) {
    const selectedHour = selectElement.value;
    const tdElement = selectElement.closest('td');
    const pElement = tdElement.querySelector('.selected-hour');
    const select = tdElement.querySelector('select');

    if (selectedHour == '(pozostaw puste)') {
        pElement.style.display = 'none';
        select.style.display = 'none';
    } else if (selectedHour) {

        select.style.display = 'none';
        pElement.style.display = 'block';
        pElement.textContent = selectedHour;
    }

    tdElement.onclick = function () {
        if (pElement.style.display === 'block' || pElement.style.display === 'none') {
            pElement.style.display = 'none';
            select.style.display = 'block';
        }
    };
}

function getMonthName(month) {
    const months = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return months[month - 1];
}

function downloadPrintableCalendar() {
    const calendarElement = document.querySelector('.calendar-container');

    if (!calendarElement) {
        alert('Najpierw wygeneruj kalendarz!');
        return;
    }

    const dpi = 300; // Rozdzielczość do druku
    const scaleFactor = dpi / 96; // Skalowanie

    html2canvas(calendarElement, {
        scale: scaleFactor, // Popraw jakość
        useCORS: true, // zasoby zew.
        logging: false
    }).then((canvas) => {
        // Rozmiar strony A4 w milimetrach
        const pageWidth = 210;
        const pageHeight = 297;


        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;


        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('kalendarz.pdf');
    }).catch((error) => {
        console.error('Błąd podczas generowania PDF:', error);
    });
}

