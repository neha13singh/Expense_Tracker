import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Valid date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const expenses = await prisma.expense.findMany({
        where: {
            userId: session.userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            tag: true,
        },
        orderBy: {
            date: 'desc',
        },
    });

    return NextResponse.json({ expenses });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { amount, tagName, date, description } = await request.json();

        if (!amount || !tagName || !date) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Find or create tag
        let tag = await prisma.tag.findUnique({
            where: {
                userId_name: {
                    userId: session.userId,
                    name: tagName,
                }
            }
        });

        if (!tag) {
            tag = await prisma.tag.create({
                data: {
                    userId: session.userId,
                    name: tagName,
                    color: generateRandomColor(),
                }
            });
        }

        // 2. Create expense
        const expense = await prisma.expense.create({
            data: {
                userId: session.userId,
                tagId: tag.id,
                amount: parseFloat(amount),
                date: new Date(date),
                description: description || null,
            },
            include: {
                tag: true
            }
        });

        return NextResponse.json({ expense });

    } catch (error) {
        console.error("Expense creation error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
