const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.1-flash-lite";


/*
|--------------------------------------------------------------------------
| FINANCIAL ANALYSIS SCHEMA
|--------------------------------------------------------------------------
*/

const financialAnalysisSchema = {
    type: "object",

    properties: {

        executive_summary: {
            type: "string"
        },

        headline: {
            type: "string"
        },

        health_score: {
            type: "integer",
            minimum: 0,
            maximum: 100
        },

        health_label: {
            type: "string"
        },

        financial_position: {
            type: "object",
            properties: {

                assessment: {
                    type: "string"
                },

                cashflow_quality: {
                    type: "string"
                },

                spending_control: {
                    type: "string"
                },

                liquidity: {
                    type: "string"
                },

                financial_strength: {
                    type: "string"
                }

            },

            required: [
                "assessment",
                "cashflow_quality",
                "spending_control",
                "liquidity",
                "financial_strength"
            ]
        },


        cashflow_analysis: {
            type: "object",
            properties: {

                assessment: {
                    type: "string"
                },

                key_driver: {
                    type: "string"
                },

                structural_condition: {
                    type: "string"
                },

                risk: {
                    type: "string"
                }

            },

            required: [
                "assessment",
                "key_driver",
                "structural_condition",
                "risk"
            ]
        },


        spending_analysis: {
            type: "object",
            properties: {

                assessment: {
                    type: "string"
                },

                dominant_category: {
                    type: "string"
                },

                dominant_category_amount: {
                    type: "number"
                },

                dominant_category_percentage: {
                    type: "number"
                },

                behavioral_pattern: {
                    type: "string"
                },

                concern: {
                    type: "string"
                },

                interpretation: {
                    type: "string"
                }

            },

            required: [
                "assessment",
                "dominant_category",
                "dominant_category_amount",
                "dominant_category_percentage",
                "behavioral_pattern",
                "concern",
                "interpretation"
            ]
        },


        budget_analysis: {
            type: "object",
            properties: {

                assessment: {
                    type: "string"
                },

                utilization_summary: {
                    type: "string"
                },

                healthy_count: {
                    type: "integer"
                },

                warning_count: {
                    type: "integer"
                },

                over_budget_count: {
                    type: "integer"
                },

                critical_categories: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },

                forecast: {
                    type: "string"
                }

            },

            required: [
                "assessment",
                "utilization_summary",
                "healthy_count",
                "warning_count",
                "over_budget_count",
                "critical_categories",
                "forecast"
            ]
        },


        savings_analysis: {
            type: "object",
            properties: {

                assessment: {
                    type: "string"
                },

                accumulation_quality: {
                    type: "string"
                },

                total_deposit: {
                    type: "number"
                },

                total_withdrawal: {
                    type: "number"
                },

                net_movement: {
                    type: "number"
                },

                saving_rate: {
                    type: "number"
                },

                target_progress: {
                    type: "array",

                    items: {
                        type: "object",

                        properties: {

                            name: {
                                type: "string"
                            },

                            current: {
                                type: "number"
                            },

                            target: {
                                type: "number"
                            },

                            percentage: {
                                type: "number"
                            },

                            interpretation: {
                                type: "string"
                            }

                        },

                        required: [
                            "name",
                            "current",
                            "target",
                            "percentage",
                            "interpretation"
                        ]
                    }
                }

            },

            required: [
                "assessment",
                "accumulation_quality",
                "total_deposit",
                "total_withdrawal",
                "net_movement",
                "saving_rate",
                "target_progress"
            ]
        },


        trend_analysis: {
            type: "object",
            properties: {

                income_trend: {
                    type: "string"
                },

                expense_trend: {
                    type: "string"
                },

                savings_trend: {
                    type: "string"
                },

                overall_direction: {
                    type: "string"
                }

            },

            required: [
                "income_trend",
                "expense_trend",
                "savings_trend",
                "overall_direction"
            ]
        },


        highlights: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    title: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    },

                    impact: {
                        type: "string",
                        enum: [
                            "positive",
                            "neutral"
                        ]
                    }

                },

                required: [
                    "title",
                    "description",
                    "impact"
                ]
            }
        },


        risks: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    title: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    },

                    severity: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high"
                        ]
                    }

                },

                required: [
                    "title",
                    "description",
                    "severity"
                ]
            }
        },


        opportunities: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    title: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    },

                    potential: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high"
                        ]
                    }

                },

                required: [
                    "title",
                    "description",
                    "potential"
                ]
            }
        },


        recommendations: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    priority: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high"
                        ]
                    },

                    action: {
                        type: "string"
                    },

                    reason: {
                        type: "string"
                    },

                    expected_impact: {
                        type: "string"
                    }

                },

                required: [
                    "priority",
                    "action",
                    "reason",
                    "expected_impact"
                ]
            }
        },


        outlook: {
            type: "object",

            properties: {

                assessment: {
                    type: "string"
                },

                next_month_focus: {
                    type: "string"
                },

                scenario: {
                    type: "string"
                }

            },

            required: [
                "assessment",
                "next_month_focus",
                "scenario"
            ]
        }

    },

    required: [

        "executive_summary",

        "headline",

        "health_score",

        "health_label",

        "financial_position",

        "cashflow_analysis",

        "spending_analysis",

        "budget_analysis",

        "savings_analysis",

        "trend_analysis",

        "highlights",

        "risks",

        "opportunities",

        "recommendations",

        "outlook"

    ]
};


/*
|--------------------------------------------------------------------------
| GENERATE FINANCIAL ANALYSIS
|--------------------------------------------------------------------------
*/

async function generateFinancialAnalysis(financialData) {

    const prompt = `
Kamu adalah "Monthly Budget Financial Intelligence Analyst".

Peranmu bukan sekadar membuat ringkasan angka.

Kamu harus berpikir seperti analis keuangan profesional yang mampu:

- membaca kondisi cashflow
- memahami struktur konsumsi
- melihat efisiensi pengeluaran
- menilai kualitas surplus
- membaca tekanan budget
- memahami perilaku finansial
- melihat risiko yang mungkin muncul
- menemukan peluang perbaikan
- memberikan rekomendasi yang realistis
- menjelaskan semuanya dengan bahasa yang mudah dipahami

==================================================
GAYA ANALISIS
==================================================

Gunakan gaya seperti laporan analis ekonomi profesional.

Jawaban harus:

1. Berbasis data.
2. Objektif.
3. Analitis.
4. Tidak menghakimi.
5. Tidak terlalu teknis.
6. Mudah dipahami orang awam.
7. Menjelaskan hubungan sebab-akibat.
8. Menjelaskan "apa yang terjadi".
9. Menjelaskan "mengapa hal tersebut penting".
10. Menjelaskan "apa risikonya".
11. Menjelaskan "apa yang sebaiknya dilakukan".

Jangan hanya mengatakan:

"Pengeluaran Anda rendah."

Lebih baik jelaskan:

"Pengeluaran yang relatif rendah dibandingkan pendapatan menghasilkan surplus
kas yang kuat. Kondisi ini positif karena sebagian besar pendapatan tidak
terserap oleh konsumsi. Namun, kualitas surplus perlu dilihat dari konsistensi
dan apakah surplus tersebut benar-benar dialihkan menjadi tabungan atau hanya
menambah saldo kas."

Gunakan logika seperti ini sepanjang analisis.


==================================================
PRINSIP EKONOMI
==================================================

Perhatikan:

- income growth
- expense growth
- cashflow margin
- expense ratio
- saving rate
- budget utilization
- concentration of spending
- savings accumulation
- savings withdrawal
- liquidity
- financial resilience
- spending behavior
- recurring vs unusual patterns jika datanya tersedia


==================================================
CASHFLOW
==================================================

Cashflow positif tidak otomatis berarti kondisi finansial sempurna.

Bedakan:

1. surplus besar karena income kuat
2. surplus karena expense rendah
3. surplus karena transaksi satu kali
4. surplus yang benar-benar dikonversi menjadi savings

Jika data tidak memungkinkan membedakannya,
katakan bahwa penyebabnya belum dapat dipastikan.


==================================================
SPENDING ANALYSIS
==================================================

Jangan langsung menganggap kategori terbesar sebagai kategori buruk.

Kategori terbesar hanya menunjukkan konsentrasi pengeluaran.

Analisis:

- seberapa besar porsinya
- apakah proporsional terhadap income
- apakah berpotensi menjadi tekanan
- apakah perlu dipantau
- apakah pola tersebut tampak struktural

Jangan memberi label "boros" tanpa bukti.


==================================================
BUDGET ANALYSIS
==================================================

Bedakan:

< 50%:
budget masih longgar

50-70%:
relatif sehat

70-85%:
perlu monitoring

85-100%:
warning

> 100%:
over budget

Tetapi jangan hanya membaca persentase.

Pertimbangkan juga:

- posisi periode
- besarnya nominal
- kategori
- kemungkinan tekanan menjelang akhir bulan


==================================================
SAVINGS ANALYSIS
==================================================

PENTING:

Savings deposit BUKAN expense.

Savings withdrawal BUKAN income.

Transfer BUKAN income.

Transfer BUKAN expense.

Jangan pernah menghitung perpindahan uang antar account
sebagai konsumsi.


==================================================
HEALTH SCORE
==================================================

Gunakan skor 0-100.

90-100:
Sangat sehat

75-89:
Sehat

60-74:
Cukup sehat

40-59:
Perlu perhatian

0-39:
Berisiko

Health score harus dijelaskan secara logis.

Jangan memberikan skor tinggi hanya karena saldo besar.

Pertimbangkan kombinasi:

- cashflow
- expense ratio
- saving rate
- budget discipline
- liquidity
- savings movement
- financial risk


==================================================
TREND
==================================================

Jika tersedia data periode sebelumnya:

Bandingkan:

income
expense
cashflow
savings
category spending

Gunakan perubahan persentase jika memungkinkan.

Contoh gaya:

"Pendapatan meningkat 25%, sementara pengeluaran hanya meningkat
10%. Artinya pertumbuhan pendapatan belum sepenuhnya diikuti oleh
pertumbuhan konsumsi. Secara struktural ini merupakan sinyal positif
karena tambahan income sebagian besar berubah menjadi surplus."

Jangan mengarang trend jika data historis tidak tersedia.


==================================================
RECOMMENDATION
==================================================

Rekomendasi harus:

- spesifik
- realistis
- dapat dilakukan
- berdasarkan data

Jangan memberikan:

- rekomendasi investasi berisiko
- trading
- crypto speculation
- leverage
- utang spekulatif
- prediksi pasar yang tidak memiliki data

Fokus pada:

- pengendalian pengeluaran
- budgeting
- emergency fund
- saving consistency
- cashflow management
- financial discipline


==================================================
BAHASA
==================================================

Gunakan Bahasa Indonesia.

Gunakan istilah profesional tetapi jelaskan dengan sederhana.

Hindari bahasa robotik.

Hindari kalimat berulang.

Hindari:

"Secara keseluruhan kondisi keuangan Anda baik."

tanpa menjelaskan alasannya.

Setiap kesimpulan penting harus memiliki alasan berbasis data.


==================================================
ATURAN ANTI-HALUSINASI
==================================================

Gunakan HANYA data yang diberikan.

Jangan:

- mengarang transaksi
- mengarang income
- mengarang expense
- mengarang budget
- mengarang saldo
- mengarang target
- mengarang trend
- mengarang persentase

Jika data tidak tersedia:

"Data tidak cukup untuk menilai bagian ini."

Jangan mengisi data yang hilang dengan asumsi.


==================================================
DATA KEUANGAN
==================================================

${JSON.stringify(financialData, null, 2)}


==================================================
OUTPUT
==================================================

Kembalikan JSON sesuai schema.

Tuliskan analisis yang cukup mendalam.

Jangan membuat jawaban pendek hanya satu atau dua kalimat.

Executive summary harus memberikan gambaran besar.

Setiap bagian harus memiliki insight yang berbeda.

Prioritaskan kualitas analisis dibanding panjang jawaban.
`;


    try {

        const response =
            await ai.models.generateContent({

                model: MODEL,

                contents: prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseSchema:
                        financialAnalysisSchema,

                    thinkingConfig: {

                        thinkingLevel:
                            "medium"

                    }

                }

            });


        const text =
            response.text;


        if (!text) {

            throw new Error(
                "Gemini tidak mengembalikan response."
            );

        }


        const parsed =
            JSON.parse(text);


        return parsed;


    } catch (error) {

        console.error(
            "Gemini Financial Analysis Error:"
        );

        console.error(error);

        throw error;

    }

}


module.exports = {
    generateFinancialAnalysis
};