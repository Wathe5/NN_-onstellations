using System;
using System.IO;
using System.Windows.Forms;

namespace NS_1
{
    public partial class Form1 : Form
    {
        Random realRnd = new Random();

        int k = 0;
        double w0;
        double wx;
        double wy;
        double nu;
        point[] p = new point[54];
        int epoch = 0;
        int count = 0;
        public class point
        {
            public double X;
            public double Y;
            public double W; //1-W1,0-W2
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            chart1.ChartAreas[0].AxisX.Minimum = -0.1;
            chart1.ChartAreas[0].AxisX.Maximum = 1.1;
            chart1.ChartAreas[0].AxisX.Interval = 0.2;
            chart1.ChartAreas[0].AxisY.Minimum = -0.1;
            chart1.ChartAreas[0].AxisY.Maximum = 1.1;
            chart1.ChartAreas[0].AxisY.Interval = 0.2;
            string str = "";
            string[] text;
            try
            {
                // Открываем файл для чтения
                using (StreamReader sr = new StreamReader("2.txt"))
                {
                    // Считываем содержимое файла и сохраняем в переменную str
                    str = sr.ReadToEnd();
                }
            }
            catch (IOException exc)
            {
                // Обработка возможных ошибок чтения файла
                MessageBox.Show("Ошибка чтения файла: " + exc.Message);
            }
            text = str.Split(',');
            int q = 0;
            for (int i = 0; i < text.GetLength(0); i += 4)
            {
                p[q] = new point();
                p[q].W = double.Parse(text[i + 1]);
                p[q].X = double.Parse(text[i + 2]);// Класс point заполнить данными образа из практической работы No2.;
                p[q].Y = double.Parse(text[i + 3]);// Класс point заполнить данными из практической работы No2.;
                //pics.Add(new picture(int.Parse(text[i + 1]), int.Parse(text[i + 2]), int.Parse(text[i + 3])));
                q++;
            }
            Normalization(p);
        }

        public void GenParams()
        {
            w0 = (double)realRnd.Next(200) / 100 - 1;
            wx = (double)realRnd.Next(200) / 100 - 1;
            wy = (double)realRnd.Next(200) / 100 - 1;
            nu = realRnd.NextDouble();
            label1.Text = "w0 = " + w0 + ";\r\nwx = " + wx + ";\r\nwy = " + wy;
        }
        public void Normalization(point[] _p)
        {
            double minX = _p[0].X, maxX = _p[0].X;
            double minY = _p[0].Y, maxY = _p[0].Y;
            for (int i = 1; i < _p.Length; i++)
            {
                if(minX > _p[i].X) minX = _p[i].X;
                if(maxX < _p[i].X) maxX = _p[i].X;
                if(minY > _p[i].Y) minY = _p[i].Y;
                if(maxY < _p[i].Y) maxY = _p[i].Y;
            }
            for (int i = 0; i < _p.Length; i++)
            {
                _p[i].X = (_p[i].X - minX) / (maxX - minX);
                _p[i].Y = (_p[i].Y - minY) / (maxY - minY);
            }
        }
        public Form1()
        {
            InitializeComponent();
            GenParams();
        }
        public void Perseptron(int n)
        {
            double S;
            int y;
            for (int i = 0; i < n / 2; i++)
            {
                S = w0 + wx * p[i].X + wy * p[i].Y;
                if (S < 0) y = 1;
                else y = 0;
                if (y == 1 && p[i].W != 1)
                {
                    k++;
                    wx = wx + nu * p[i].X;
                    wy = wy + nu * p[i].Y;
                    w0 = w0 + nu;
                }
                else if (y == 0 && p[i].W != 0)
                {
                    k++;

                    wx = wx - nu * p[i].X;
                    wy = wy - nu * p[i].Y;
                    w0 = w0 - nu;
                }
            }
            for (int i = 27; i < 27 + n / 2; i++)
            {
                S = w0 + wx * p[i].X + wy * p[i].Y;
                if (S < 0) y = 1;
                else y = 0;
                if (y == 1 && p[i].W != 1)
                {
                    k++;
                    wx = wx + nu * p[i].X;
                    wy = wy + nu * p[i].Y;
                    w0 = w0 + nu;
                }
                else if (y == 0 && p[i].W != 0)
                {
                    k++;

                    wx = wx - nu * p[i].X;
                    wy = wy - nu * p[i].Y;
                    w0 = w0 - nu;
                }
            }
        }
        private void button1_Click(object sender, EventArgs e)
        {
            count = 0;
            for (int i = 0; i < 9; i++)
                chart1.Series["Созвездия"].Points.AddXY(p[i].X, p[i].Y);
            for (int i = 27; i < 27+9; i++)
                chart1.Series["Фоны"].Points.AddXY(p[i].X, p[i].Y);
            chart1.Series[2].Points.Clear();
            chart1.Series[2].Points.AddXY(0, (-wx * 0 - w0) / wy);
            chart1.Series[2].Points.AddXY(20, (-wx * 20 - w0) / wy);
            button5.Enabled = true;
            button1.Enabled = false;
            epoch = 1;
        }
        private void button2_Click(object sender, EventArgs e)
        {
            count = 0;
            for (int i = 0; i < 18; i++)
                chart1.Series["Созвездия"].Points.AddXY(p[i].X, p[i].Y);
            for (int i = 27; i < 27 + 18; i++)
                chart1.Series["Фоны"].Points.AddXY(p[i].X, p[i].Y);
            chart1.Series[2].Points.Clear();
            chart1.Series[2].Points.AddXY(0, (-wx * 0 - w0) / wy);
            chart1.Series[2].Points.AddXY(20, (-wx * 20 - w0) / wy);
            button5.Enabled = true;
            button2.Enabled = false;
            epoch = 2;
        }
        private void button3_Click(object sender, EventArgs e)
        {
            count = 0;
            for (int i = 0; i < 27; i++)
                chart1.Series["Созвездия"].Points.AddXY(p[i].X, p[i].Y);
            for (int i = 27; i < 27 + 27; i++)
                chart1.Series["Фоны"].Points.AddXY(p[i].X, p[i].Y);
            chart1.Series[2].Points.Clear();
            chart1.Series[2].Points.AddXY(0, (-wx * 0 - w0) / wy);
            chart1.Series[2].Points.AddXY(20, (-wx * 20 - w0) / wy);
            button5.Enabled = true;
            button3.Enabled = false;
            epoch = 3;
        }
        private void button4_Click(object sender, EventArgs e)
        {
            chart1.Series[0].Points.Clear();
            chart1.Series[1].Points.Clear();
            chart1.Series[2].Points.Clear();
            epoch = 0;
            count = 0;
            k = 0;
            GenParams();
            button1.Enabled = true;
            button2.Enabled = true;
            button3.Enabled = true;
            button5.Enabled = false;
        }
        private void button5_Click(object sender, EventArgs e)
        {
            count++;
            k = 0;
            if (epoch == 1)
                Perseptron(18);
            else if (epoch == 2)
                Perseptron(36);
            else 
                Perseptron(54);

            if (k != 0)
            {
                button5_Click(sender, e);
            }
            else if (epoch == 1)
            {
                button2.Enabled = true;
            }
            else if (epoch == 2)
            {
                button3.Enabled = true;
            }
            button5.Enabled = false;
            chart1.Series[2].Points.Clear();
            label1.Text = "w0 = " + w0 + ";\r\nwx = " + wx + ";\r\nwy = " + wy;
            chart1.Series[2].Points.AddXY(0, (-wx * 0 - w0) / wy);
            chart1.Series[2].Points.AddXY(20, (-wx * 20 - w0) / wy);
            File.WriteAllText("weights1.txt", w0 + ";" + wx + ";" + wy);
        }
    }
}
