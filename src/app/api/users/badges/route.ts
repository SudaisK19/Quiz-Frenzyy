
import { NextRequest, NextResponse } from 'next/server'
import UserNew from '@/models/userModel'
import PlayerQuizNew from '@/models/playerQuizModel'
import { connect } from '@/dbConfig/dbConfig'

async function countParticipation(userId: string) {
  return PlayerQuizNew.countDocuments({ player_id: userId })
}

function getBadges(points: number, plays: number, hosts: number) {
  const badges: { name: string; imageUrl: string; description: string }[] = []

  if (plays >= 1) {
    badges.push({
      name: 'first quiz conqueror',
      imageUrl: '/badges/first-quiz-conqueror.png',
      description: 'first quiz done',
    })
  }
  if (plays >= 5) {
    badges.push({
      name: 'quiz dynamo',
      imageUrl: '/badges/quiz-dynamo.png',
      description: '5 quizzes done',
    })
  }
  if (plays >= 10) {
    badges.push({
      name: 'quiz virtuoso',
      imageUrl: '/badges/quiz-virtuoso.png',
      description: '10 quizzes done like a pro',
    })
  }
  if (plays >= 50) {
    badges.push({
      name: 'quiz legend',
      imageUrl: '/badges/quiz-legend.png',
      description: '50 quizzes done like a legend',
    })
  }

  if (points >= 50) {
    badges.push({
      name: 'point pioneer',
      imageUrl: '/badges/point-pioneer.png',
      description: '50 points earned',
    })
  }
  if (points >= 100) {
    badges.push({
      name: 'centurion',
      imageUrl: '/badges/centurion.png',
      description: '100 points earned',
    })
  }
  if (points >= 200) {
    badges.push({
      name: 'double century champion',
      imageUrl: '/badges/double-century-champion.png',
      description: '200 points earned',
    })
  }
  if (points >= 500) {
    badges.push({
      name: 'Millennium Master',
      imageUrl: '/badges/millennium-master.png',
      description: '500 points earned',
    })
  }

  if (hosts >= 1) {
    badges.push({
      name: 'quiz host extraordinaire',
      imageUrl: '/badges/quiz-host-extraordinaire.png',
      description: 'hosted your first quiz',
    })
  }
  if (hosts >= 10) {
    badges.push({
      name: 'master quiz host',
      imageUrl: '/badges/master-quiz-host.png',
      description: 'hosted 10 quizzes',
    })
  }

  return badges
}

export async function POST(req: NextRequest) {
  await connect()
  try {
    const body = await req.json()
    const { userId } = body
    if (!userId) {
      return NextResponse.json({ error: 'need user' }, { status: 400 })
    }

    const user = await UserNew.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'no user' }, { status: 404 })
    }

    const plays = await countParticipation(userId)
    const hosts = user.hosted_quizzes ? user.hosted_quizzes.length : 0
    const newBadges = getBadges(user.total_points, plays, hosts)

    user.badges = newBadges
    await user.save()

    return NextResponse.json({ success: true, badges: newBadges })
  } catch (error) {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
